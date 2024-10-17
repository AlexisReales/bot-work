import express, { Express, Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
import { Client, LocalAuth, Chat } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import cors from "cors";
import dotenv from "dotenv";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { storeQR } from "./utils/qrStorage";
// API files
import messages from "./routes/messages";
import clients from "./routes/clients";
import chats from "./routes/chats";
import users from "./routes/users";
import groups from "./routes/groups";
import contacts from "./routes/contacts";
import templates from "./routes/templates";
import quickMessageRoutes from './routes/quickMessageRoutes';
import { delay } from "./utils/delay";
import ClientService from "./services/clients";
import { EventEmitter } from 'events';

// Aumente o limite global de ouvintes
EventEmitter.defaultMaxListeners = 1500;

// Sockets
import { initializeSocket } from "./sockets/sockets";

// Environment variables configuration
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "unknown";

//=======================================================================================
//===================================> API config <======================================
//=======================================================================================

const app: Express = express();

// Swagger UI configuration
const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "WhatsApp Automation API",
      version: "0.1.0",
      description:
        "This is a WhatsApp Automation API made with Express and documented with Swagger",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "Matheus Ferreira",
        url: "https://matheusferrera.com",
        email: "info@email.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["**/swagger/*.yaml"],
};

// Swagger UI route
const specs = swaggerJsdoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// API Routes
app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
app.use('/messages', messages);
app.use('/clients', clients);
app.use('/chats', chats);
app.use('/users', users);
app.use('/groups', groups);
app.use('/contacts', contacts);
app.use('/template', templates)
app.use('/quickmessages', quickMessageRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Require database
import { MongoStore } from "wwebjs-mongo";
import mongoose from "mongoose";

// MongoDB Models
import MessageModel from "./models/Message";
import User from "./models/User";
import ClientModel from "./models/Client";
import ChatModel from "./models/Chat";
import { Socket } from "socket.io-client";

// MongoDB connection
mongoose.connect(MONGODB_URI);
const db = mongoose.connection;
const store = new MongoStore({ mongoose: mongoose });

db.once("open", async () => {
  console.log("\x1b[36m[DB] => Server connected to MongoDB\x1b[0m");

  // Create a change stream on the Message collection
  const changeStream = MessageModel.watch();

  // // Get all clients from DB
  const savedClients = await ClientModel.find();

  // //Initialize all WhatsApp clients
  savedClients.forEach((client:any) => {
    const clientId = client["_id"].toString();
    console.log(
      `[initializeClientFunction] => Initializing client - ${clientId}`
    );
    io.to(clientId).emit("whatsNumber", {
      status: "Iniciando",
      message: "Iniciando."
    })
    // Initialize WhatsApp client if not already initialized
    if (!whatsappClients.has(clientId)) {
      initializeWhatsAppClient(clientId)
        .then((whatsappClient) => {
          console.log(
            `[initializeClientFunction] => Client initialized - ${clientId}`
          );
          console.log(
            `[initializeClientFunction] => Initializing sniffer - ${clientId}`
          );
          snifferWhatsAppClient(clientId, whatsappClient);
        })
        .then((sniffer) => {
            console.log(
              `[initializeClientFunction] => Sniffer initialized - ${clientId}`
            )
        });
    }
  });

  // Listen for change events
  changeStream.on("change", (change) => {
    // console.log("Change detected:", change);
    console.log(`[snifferDB] => new modification DB`);
    console.log(change.ns);
    // Emit a socket event or perform any action based on the change
  });
});

// Handle MongoDB connection errors
db.on("error", (error) => {
  console.error("\x1b[31m[DB] => MongoDB connection error:\x1b[0m", error);
});

//========================================================================================
//================================>  Whatsapp config  <===================================
//========================================================================================

// WhatsApp clients map to store client instances by clientId
const whatsappClients = new Map();

// Function to initialize WhatsApp client with clientId
async function initializeWhatsAppClient(clientId: any) {
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

  whatsappClient.on("loading_screen", (percent, message) => {
    console.log(
      `[initializeWhatsAppClient] => Loading whatsapp connection ${percent}% - ${clientId}`
    );
  });

  whatsappClient.on("authenticated", () => {
    console.log(
      `[initializeWhatsAppClient] => Client authenticated - ${clientId}`
    );
    io.to(clientId).emit("whatsNumber", {
      status: "Autenticando",
      message: "Client authenticated."
    })
  });

  whatsappClient.on("auth_failure", (msg) => {
    console.log(`[initializeWhatsAppClient] => Auth failure - ${clientId}`);
    io.to(clientId).emit("whatsNumber", {
      status: "auth-fail",
      message: "Auth failure."
    })
  });

  whatsappClient.on("qr", (qr) => {
    console.log(
      `[initializeWhatsAppClient] => Generated qr-code - ${clientId}`
    );
    io.to(clientId).emit("whatsNumber", {
      status: "qrcode",
      message: "QR code gerado. Escaneie para conectar.",
      qr: qr
    });
    storeQR(clientId, qr);
  });

  whatsappClient.on("ready", () => {
    console.log(
      `\u001b[34m[initializeWhatsAppClient] => Client is READY - ${clientId}\u001b[0m`
    );
    io.to(clientId).emit("whatsNumber", {
      status: "Ativando",
      message: "Client is READY"
    })
    setTimeout(() => {
      ClientService.activeClients(clientId);
    }, 2000);
  });

  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await whatsappClient.initialize();
      break; // Se bem-sucedido, saia do loop
    } catch (error) {
      console.error(`Erro ao inicializar o cliente ${clientId}:`, error);
      io.to(clientId).emit("whatsNumber", {
        status: "Número desconectado",
        message: "Client is READY"
      })
      
      retries++;
      if (retries >= maxRetries) {
        throw error; // Se todas as tentativas falharem, lance o erro
      }
      await delay(5000); // Espere 5 segundos antes de tentar novamente
    }
  }

  // Store the client instance in the map
  whatsappClients.set(clientId, whatsappClient);

  return whatsappClient;
}

async function snifferWhatsAppClient(clientId: any, whatsappClient: Client) {
  
  whatsappClient.on("message_create", async (message) => {

    if(message.fromMe) {
      console.log(`[snifferWhatsAppClient] => Sent message - ${clientId}`);

      io.to(clientId).emit("message", message);

      // get last N chats
      const chats = await whatsappClient.getChats();
      const n = 3;
      const lastNChats = chats.slice(0, n);

      // get last N messages for a window-specific chat
      const wppId = lastNChats[0].id._serialized;                                     // example
      const activeChat = chats.filter((chat) => chat.id._serialized == wppId)[0];
      const searchOptions = { limit: 10 };
      const last10MessageActiveChat = await activeChat.fetchMessages(searchOptions);

      // emit socket events for the frontend
      io.to(clientId).emit("message-sent", message);
      io.to(clientId).emit("last-chats", lastNChats);
      io.to(clientId).emit("last-messages", last10MessageActiveChat);
    } else {
      console.log(`[snifferWhatsAppClient] => Received message - ${clientId}`);
      io.to(clientId).emit("message-received", message);
      io.to(clientId).emit("message", message);
    }

    const userId = message.from;

    console.log("CHEGOU AQUI", userId);

    // Ignore status messages
    if (userId !== "status@broadcast") {
      // Create a new message document
      const newMessage = new MessageModel(message);

      console.log("CHEGOU AQUI 2");

      const messageChat: Chat = await message.getChat();

      console.log("CHEGOU AQUI 3");
      
 
      // Find the chat by clientId and save the message document to the collection
      ChatModel.findOneAndUpdate(
        { remoteId: message.id.remote, clientId: clientId, isGroup: messageChat.isGroup },
        { $push: { messages: newMessage } },
        { upsert: true, new: true }
      )
      .then((user) => {
        console.log("CHEGOU AQUI 4");
        console.log(
          `\x1b[36m[snifferWhatsAppClient] => Saved chat into DB - ${clientId}\x1b[0m`
        );
      })
      .catch((error) => {
        console.log(
          `\x1b[31m[snifferWhatsAppClient ERROR] => Save chat into DB - ${clientId} // ${error}\x1b[0m`
        );
      });

    }
  });
}

// WebSocket initialization
initializeSocket();

// Start the server
const port = process.env.PORT || 3030;
server.listen(port, () => {
  console.log(`\x1b[33m[server] => Server is running on port ${port}\x1b[0m`);
});

// Exports to use in other files
export { io, whatsappClients, initializeWhatsAppClient };
