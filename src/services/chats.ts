import ChatsModel from "../models/Chat";
import { MessageMedia } from "whatsapp-web.js";
import { whatsappClients } from "..";
import { Document } from 'mongoose';

interface IChat extends Document {
    messages: Array<{ body: string, type: string, timestamp: number, to: string, from: string, fromMe: boolean }>;
}

const getChats = async (clientId: string, limit: number, page: number) => {
    try {
        let response;
        const whatsapp = whatsappClients.get(clientId);
        
        if(whatsapp == undefined){
            return {error: "whatsapp client doesnt exist or not ready"}
        }
        
        response = await whatsapp.getChats()

        response = response.map(({ id, name, timestamp, unreadCount, lastMessage }: any) => ({
            id,
            name,
            timestamp,
            unreadCount,
            lastMessage: lastMessage ? {body: lastMessage._data.body, type: lastMessage._data.type, author: lastMessage._data.author} : '', // Verifica se lastMessage existe antes de acessar _data.body
          }));
        
        const init = page * limit
        const final = init + limit
        response = response.slice(init, final)
            
        return response;
   
    } catch (e: any) {
        console.log("ERROR -> ", e);
        throw e.message
    }
}

const getChatsDB = async (clientId: string) => {
    try {
        let response;
        if (clientId) {
            response = await ChatsModel.find({ clientId: clientId });
        } else {
            response = await ChatsModel.find();
        }

        return response;

    } catch (e: any) {
        console.log("[getClient ERROR] =>  ", e);
        throw e
    }
}

const getMessagesChats = async (clientId: string, wppNumber: string, limit: number, page: number) => {
    try {
        let formatedNumber = `${wppNumber}@c.us`;  // Assumindo que este é o formato correto para o remoteId

        const skip = (page - 1) * limit;

        const chat = await ChatsModel.findOne({ clientId: clientId, remoteId: formatedNumber }) as IChat | null;

        if (!chat) {
            return { "error": "Chat não encontrado" };
        }

        const totalMessages = chat.messages.length;
        const totalPages = Math.ceil(totalMessages / limit);

        const messages = chat.messages
            .sort((a, b) => b.timestamp - a.timestamp)  // Ordena do mais recente para o mais antigo
            .slice(skip, skip + limit)
            .map(message => ({
                body: message.body,
                type: message.type,
                timestamp: message.timestamp,
                to: message.to,
                from: message.from,
                fromMe: message.fromMe
            }));

        return {
            messages: messages,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalMessages: totalMessages,
            }
        };

    } catch (e: any) {
        console.log("ERROR -> ", e);
        throw e.message;
    }
}

const createChats = async (clientId: string, remoteId: string, message: string, mimeType?: string, media?: string) => {
    try {
        let response;

        const whatsapp = whatsappClients.get(clientId);
        if(whatsapp == undefined){
            return {"error": "client is not exist or not activate"}
        }

        // Verifica se remoteId é uma string válida e não está vazia
        if (!remoteId || typeof remoteId !== 'string' || remoteId.trim() === '') {
            return {"error": "Invalid remoteId provided"}
        }

        let formatedNumber;
        try {
            formatedNumber = await whatsapp.getNumberId(remoteId);
        } catch (error) {
            console.error("Error getting number ID:", error);
            return {"error": "Failed to get number ID"}
        }

        if(formatedNumber == undefined){
            return {"error": "number is not registered on whatsapp"}
        }
        formatedNumber = formatedNumber._serialized

        // Obter o nome do contato
        const contact = await whatsapp.getContactById(formatedNumber);
        const contactName = contact.name || contact.pushname || remoteId;

        let respMessage;
        if(mimeType && media) {
            const messageMedia = new MessageMedia(mimeType, media);
            respMessage = await whatsapp.sendMessage(formatedNumber, messageMedia, {"sendAudioAsVoice": true, "caption": message});
        } else {
            respMessage = await whatsapp.sendMessage(formatedNumber, message);
        }

        let responseFormated = {
            body: respMessage.body,
            type: respMessage.type,
            timestamp: respMessage.timestamp,
            to: respMessage.to,
        }

        // Atualizar ou criar o chat no MongoDB
        const updatedChat = await ChatsModel.findOneAndUpdate(
            { clientId: clientId, remoteId: formatedNumber },
            { 
                $set: { contactName: contactName },
                $push: { messages: responseFormated }
            },
            { upsert: true, new: true }
        );

        response = responseFormated;
        return response;
   
    } catch (e: any) {
        console.log("ERROR -> ", e);
        throw e.message
    }
}

const getLabels = async (clientId: string, remoteId: string) => {
    try {
        let response;
        // const whatsapp = whatsappClients.get(clientId);
        // const groupObj = await whatsapp.getChatById(remoteId);
        // const group = groupObj as GroupChat;
        // response = await group.getLabels();
        response = await ChatsModel.find({ clientId: clientId, remoteId: remoteId });

        return response;
   
    } catch (e: any) {
        console.log("ERROR -> ", e);
    }
}

const addLabels = async (clientId: string, remoteId: string, label: string) => {
    try {
        let response;
        // const whatsapp = whatsappClients.get(clientId);
        // const groupObj = await whatsapp.getChatById(remoteId);
        // const group = groupObj as GroupChat;
        response = await ChatsModel.findOneAndUpdate(
            { clientId: clientId, remoteId: remoteId }, 
            { $push: { labels: label } },
            { upsert: true, new: true }
        );

        return response;
   
    } catch (e: any) {
        console.log("ERROR -> ", e);
    }
}

const deleteLabels = async (clientId: string, remoteId: string, label: string) => {
    try {
        let response;
        // const whatsapp = whatsappClients.get(clientId);
        // const groupObj = await whatsapp.getChatById(remoteId);
        // const group = groupObj as GroupChat;
        // response = await group.changeLabels([labelId]);
        response = await ChatsModel.deleteOne(
            { clientId: clientId, remoteId: remoteId },
            { $pull: { labels: label } },
        );

        return response;
   
    } catch (e: any) {
        console.log("ERROR -> ", e);
    }
}


const ChatService = {
    getChats,
    getChatsDB,
    getMessagesChats,
    createChats,
    getLabels,
    addLabels,
    deleteLabels
}


export default ChatService;