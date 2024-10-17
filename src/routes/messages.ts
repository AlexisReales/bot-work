import express, { Router, Request, Response } from "express";
import MessageController from "../controllers/messages";

const router: Router = express.Router();


// GET /messages
router.get('/:clientId', MessageController.getMessages);
router.get('/:clientId/:userId', MessageController.getMessages);

// POST /messages
router.post('/', MessageController.createMessages);

// DELETE /messages
router.delete('/:clientId', MessageController.deleteMessages);
router.delete('/:clientId/:userId', MessageController.deleteMessages);


export default router;