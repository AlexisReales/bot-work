import { io, whatsappClients, initializeWhatsAppClient } from '../index';
import ClientModel, { IClient } from "../models/Client";
import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import fs from 'fs/promises';
import path from 'path';

const qrCodeQueue: { [key: string]: string[] } = {}; // Fila de QR codes por clientId

const getClients = async (clientId: string) => {
    try {
        let response;
        if (clientId) {
            response = await ClientModel.find({ userId: clientId });
        } else {
            response = await ClientModel.find();
        }

        return response;

    } catch (e: any) {
        console.log("[getClient ERROR] =>  ", e);
        throw e
    }
}

const getQRClient = async (clientId: string) => {
    try {
        let response;
        if (clientId) {
            response = await ClientModel.find({ _id: clientId });
        } else {
            response = await ClientModel.find();
        }

        return response;

    } catch (e: any) {
        console.log("[getClient ERROR] =>  ", e);
        throw e
    }
}
const createClient = async (reqBody: IClient) => {
    try {
        const newClient = new ClientModel(reqBody);
        const savedClient = await newClient.save();
        return savedClient;
    } catch (e: any) {
        console.log("[createClient ERROR] =>  ", e);
        throw e
    }
}

const changeClients = async (clientId: string) => {
    try {
        const response = await ClientModel.findOneAndUpdate({ clientId: clientId }, { upsert: true, new: true });
        return response;

    } catch (e: any) {
        console.log("[changeClient ERROR] =>  ", e);
        throw e
    }
}




const activeClients = (clientId: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            const clientExist = [];

            // if (clientExist.length === 0) {
            //     console.log(`[activeClient] => Client ${clientId} doesn't exist`);
            //     resolve({"Error": "Client doesn't exist"});
            // }

            console.log(`[activeClient] => Activating client - ${clientId}`);

            io.to(clientId).emit("whatsNumber", {
                status: "Ativando",
                message: "Client is READY"
            })

            const whatsappClient = new Client({
                authStrategy: new LocalAuth({
                  dataPath: `client_${clientId}`,
                  clientId: `client_${clientId}`
                }),
                puppeteer: {
                    headless: true,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--no-first-run',
                        '--no-zygote',
                        '--single-process',
                        '--disable-gpu',
                        '--disable-extensions',
                        '--disable-software-rasterizer',
                        '--ignore-certificate-errors',
                        '--disable-infobars'
                    ],
                    defaultViewport: null,
                    timeout: 60000,
                    ignoreHTTPSErrors: true,
                },
                qrMaxRetries: 3,
                authTimeoutMs: 120000,
                takeoverOnConflict: true,
                takeoverTimeoutMs: 0,
                restartOnAuthFail: true,
            });

            await whatsappClient.initialize();

            io.to(clientId).emit("whatsNumber", {
                status: "Conectado",
                message: "Client is READY"
            })

            whatsappClient.on("loading_screen", (percent, message) => {
                console.log(`[activeClient] => Loading whatsapp connection.... ${clientId} // ${message}`);
            });

            whatsappClient.on("qr", (qr) => {
                console.log(`[activeClient] => Generated qr-code - ${clientId}`);
            });

            whatsappClient.on("auth_failure", (message) => {
                console.log(`[activeClient] => Auth failure - ${clientId} // ${message}`);
                resolve({"Error": "Auth failure"});
            });

            whatsappClient.on("ready", () => {
                console.log(`[activeClient] => Client is ready - ${clientId}`);
                resolve({"Success": "Client is ready"});

            });

            
        } catch (error) {
            console.log("ERROR -> ", error);
            reject(error);
        }
    });
};


const deleteClients = async (clientId: string) => {
    try {
        const response = await ClientModel.deleteOne({ _id: clientId });
        
        const client = whatsappClients.get(clientId);
        if (client) {
            await client.destroy();
            whatsappClients.delete(clientId);
            console.log(`Conexão com o cliente ${clientId} foi fechada.`);
        } else {
            console.log(`Cliente ${clientId} não encontrado.`);
        }
        return response;

    } catch (e: any) {
        console.log("ERROR -> ", e);
    }
}

const getClientStatus = async (clientId: string) => {
    const client = whatsappClients.get(clientId);
    if (!client) {
        return { status: 'DISCONNECTED', isActive: false, message: 'Cliente não encontrado ou desconectado' };
    }

    try {
        const state = await client.getState();
        return { 
            status: state, 
            isActive: ['CONNECTED', 'OPENING'].includes(state)
        };
    } catch (error) {
        console.error(`Erro ao obter estado do cliente ${clientId}:`, error);
        // Assumimos que se houver um erro ao obter o estado, o cliente está desconectado
        return { status: 'DISCONNECTED', isActive: false, message: 'Cliente provavelmente desconectado' };
    }
}

const disconnectClient = async (clientId: string) => {
    const client = whatsappClients.get(clientId);
    if (!client) {
        return { status: 'success', message: 'Cliente já está desconectado' };
    }

    try {
        // Tenta fazer logout, mas não espera pela conclusão
        client.logout().catch((error: Error) => {
            console.error(`Erro durante logout do cliente ${clientId}:`, error);
        });

        // Remove o cliente da lista imediatamente
        whatsappClients.delete(clientId);

        // Agenda a limpeza dos arquivos da sessão
        scheduleSessionCleanup(clientId);

        return { status: 'success', message: 'Cliente desconectado e limpeza agendada' };
    } catch (error) {
        console.error(`Erro ao desconectar cliente ${clientId}:`);
        whatsappClients.delete(clientId);
        scheduleSessionCleanup(clientId);
        return { status: 'warning', message: 'Cliente removido, mas houve um erro durante o processo' };
    }
}

const scheduleSessionCleanup = (clientId: string) => {
    const cleanupInterval = setInterval(async () => {
        try {
            const sessionDir = path.join(process.cwd(), `client_${clientId}`);
            await fs.rm(sessionDir, { recursive: true, force: true });
            console.log(`Diretório da sessão removido: ${sessionDir}`);
            clearInterval(cleanupInterval);
        } catch (error) {
            console.error(`Tentativa de limpeza falhou para ${clientId}`);
            // Continua tentando na próxima iteração
        }
    }, 10000); // Tenta a cada 10 segundos

    // Para de tentar após 5 minutos (30 tentativas)
    setTimeout(() => {
        clearInterval(cleanupInterval);
        console.log(`Limpeza para ${clientId} interrompida após 5 minutos`);
    },30000);
}

const ClientService = {
    getClients,
    createClient,
    changeClients,
    deleteClients,
    activeClients,
    getClientStatus,
    disconnectClient
}

export default ClientService;