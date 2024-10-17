import { io, whatsappClients, initializeWhatsAppClient } from '../index';
import { getLatestQR } from "../utils/qrStorage";
import ClientController from "../controllers/clients";

function initializeSocket() {
  io.on("connection", async (socket) => {
    // Receive client ID from the frontend
    const clientId = socket.handshake.query.clientId as string;
  
    // Check existence of received clientId query
    if (clientId && typeof clientId !== "undefined") {
      console.log(`\x1b[33m[socket] => Client connected - ${clientId}\x1b[0m`);
      // Join the room corresponding to the client ID
      socket.join(clientId);

      const latestQR = getLatestQR(clientId);
      if (latestQR) {
        const client = whatsappClients.get(clientId);
        const clientStatus = await ClientController.getClientStatusDirect(clientId);
        console.log(clientStatus)
        if (client && clientStatus?.isActive === false) {
          socket.emit("whatsNumber", {
            status: "qrcode",
            message: "QR code disponível. Escaneie para conectar.",
            qr: latestQR
          });
        }
      }
  
      // Initialize WhatsApp client if not already initialized
      if (!whatsappClients.has(clientId)) {
        initializeWhatsAppClient(clientId);
      }
    } else {
      console.log("[socket] => A client connected");
    }
  
    // Handle socket disconnection
    socket.on("disconnect", () => {
      if (clientId && typeof clientId !== "undefined") {
        console.log(`[socket] => Client disconnected - ${clientId}`);
      } else {
        console.log("[socket] => A client disconnected");
      }
    });
  });
}

export { initializeSocket };
