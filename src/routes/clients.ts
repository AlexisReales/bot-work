import express, { Router } from "express";
import ClientController from "../controllers/clients";

const router: Router = express.Router();


// GET /clients
router.get('/', ClientController.getClients);
router.get('/:clientId', ClientController.getClients);

// POST /clients
router.post('/', ClientController.createClients);
router.post('/activeClient/:clientId', ClientController.activeClients);

// POST /clients/disconnect/:clientId
router.post('/disconnect/:clientId', ClientController.disconnectClient);

// PUT /clients
router.put('/:clientId', ClientController.changeClients);

// DELETE /clients
router.delete('/:clientId', ClientController.deleteClients);

// Rota para verificar o status da conexão
router.get('/status/:clientId', ClientController.getClientStatus);


export default router;