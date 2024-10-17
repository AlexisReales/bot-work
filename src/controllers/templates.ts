import {Request, Response } from "express";
import TemplatesService from "../services/templates";

const getTemplates = async(req: Request, res: Response) => {
    try {
        const templateId = req.params.templateId;
        const templateName = req.params.templateName
        const response = await TemplatesService.getTemplates(templateId, templateName);
        res.send(response);
    } catch (e: any) {
        res.status(500).send(e.toString());
    }
}

const createTemplates = async(req: Request, res: Response) => {
    try {
        const templateId = req.params.templateId;
        const reqBody = req.body;
        const response = await TemplatesService.createTemplate(templateId, reqBody);
        res.send(response);
    } catch (e: any) {
        res.status(500).send(e.toString());
    }
}

const sendMessageTemplate = async(req: Request, res: Response) => {
    try {
        const clientId = req.params.clientId;
        const wppNumber = req.params.wppNumber;
        const templateBody = req.body
        const response = await TemplatesService.sendMessageTemplate(clientId, wppNumber, templateBody);
        res.send(response);
    } catch (e: any) {
        res.status(500).send(e.toString());
    }
}


const analyzeMessageTemplate = async(req: Request, res: Response) => {
    try {
        const clientId = req.params.clientId;
        const wppNumber = req.body.wppNumber;
        const templateName = req.body.templateName;
        const response = await TemplatesService.analyzeMessageTemplate(clientId, wppNumber, templateName);
        res.send(response);
    } catch (e: any) {
        res.status(500).send(e.toString());
    }
}

const changeTemplates = async(req: Request, res: Response) => {
    try {
        const templateId = req.params.templateId;
        const templateBody = req.body
        const response = await TemplatesService.changeTemplates(templateId, templateBody);
        res.send(response);
    } catch (e: any) {
        res.status(500).send(e.toString());
    }
}

const deleteTemplates = async(req: Request, res: Response) => {
    try {
        const templateId = req.params.templateId;
        const response = await TemplatesService.deleteTemplates(templateId);
        res.send(response);
    } catch (e: any) {
        res.status(500).send(e.toString());
    }
}

const TemplatesController = {
    getTemplates,
    createTemplates,
    sendMessageTemplate,
    analyzeMessageTemplate,
    changeTemplates,
    deleteTemplates
}

export default TemplatesController;