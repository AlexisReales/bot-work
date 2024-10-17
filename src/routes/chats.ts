import express, { Router, Request, Response } from "express";
import ChatController from "../controllers/chats";

const router: Router = express.Router();


// GET /chats
router.get('/:clientId', ChatController.getChats);
router.get('/normal/:clientId', ChatController.getChatsDB);
router.get('/getMessage/:clientId/:wppNumber', ChatController.getMessagesChats);
router.get('/labels/:clientId/:remoteId', ChatController.getLabels);

// POST /chats
router.post('/sendMessage/', ChatController.createChats);
router.post('/labels/:clientId/:remoteId', ChatController.addLabels);

// DELETE /chats
router.delete('/labels/:clientId/:remoteId', ChatController.deleteLabels);


export default router;