import {Request, Response } from "express";
import ChatService from "../services/chats";

const getChats = async(req: Request, res: Response) => {
    try {
        const clientId = req.params.clientId;
        const limit = parseInt(req.query.limit as string) ;
        const page = parseInt(req.query.page as string) ;
        const response = await ChatService.getChats(clientId, limit, page);
        res.send(response);
    } catch (e: any) {
        res.status(500).send(e.toString());
    }
}

const getChatsDB = async(req: Request, res: Response) => {
    try {
        const clientId = req.params.clientId;
        const response = await ChatService.getChatsDB(clientId);
        res.send(response);
    } catch (e: any) {
        res.status(500).send(e.toString());
    }
}

const getMessagesChats = async(req: Request, res: Response) => {
    try {
        const clientId = req.params.clientId;
        const wppNumber = req.params.wppNumber;
        const limit = parseInt(req.query.limit as string) ;
        const page = parseInt(req.query.page as string) ;
        const response = await ChatService.getMessagesChats(clientId, wppNumber, limit, page);
        res.send(response);
    } catch (e: any) {
        res.status(500).send(e.toString());
    }
}

const createChats = async(req: Request, res: Response) => {
    try {
        const clientId = req.body.clientId;
        const remoteId = req.body.remoteId;
        const message = req.body.message;
        const mimeType = req.body.mimeType;
        const media = req.body.media;
        const response = await ChatService.createChats(clientId, remoteId, message, mimeType, media);
        res.send(response);
    } catch (e: any) {
        res.status(500).send(e.toString());
    }
}

const getLabels = async(req: Request, res: Response) => {
    try {
        const clientId = req.params.clientId;
        const remoteId = req.params.remoteId;
        const response = await ChatService.getLabels(clientId, remoteId);
        res.send(response);
    } catch (e: any) {
        res.status(500).send(e.toString());
    }
}

const addLabels = async(req: Request, res: Response) => {
    try {
        const clientId = req.params.clientId;
        const remoteId = req.params.remoteId;
        const label = req.body.label;
        const response = await ChatService.addLabels(clientId, remoteId, label);
        res.send(response);
    } catch (e: any) {
        res.status(500).send(e.toString());
    }
}

const deleteLabels = async(req: Request, res: Response) => {
    try {
        const clientId = req.params.clientId;
        const remoteId = req.params.remoteId;
        const labelId = req.body.labelId;
        const response = await ChatService.deleteLabels(clientId, remoteId, labelId);
        res.send(response);
    } catch (e: any) {
        res.status(500).send(e.toString());
    }
}


const ChatController = {
    getChats,
    getChatsDB,
    getMessagesChats,
    createChats,
    getLabels,
    addLabels,
    deleteLabels
}


export default ChatController;
