import TemplateModel, { ITemplate } from "../models/Template";
import TemplateMessageModel, { ITemplateMessage } from "../models/TemplateMessages";
import { MessageMedia } from "whatsapp-web.js";
import { whatsappClients } from "..";

const getTemplates = async (templateId: string, templateName: string) => {
    try {
        let response;
        if (templateId && !templateName) {
            response = await TemplateModel.find({ templateId: templateId });
        } else if (templateId && templateName) {
            response = await TemplateModel.find({ templateId: templateId, 'template.name': templateName })
        }

        return response;

    } catch (e: any) {
        console.log("[getUser ERROR] =>  ", e);
        throw e;
    }
}


const createTemplate = async (templateId: string, reqBody: ITemplate) => {
    try {
        const newTemplate = new TemplateModel({...reqBody, templateId});
        await newTemplate.save()
        return newTemplate;
    } catch (e: any) {
        console.log("[createTemplate ERROR] =>  ", e);
        throw e;
    }
}

const sendMessageTemplate = async (clientId: string, wppNumber: string, templateBody: ITemplateMessage) => {
    try {


        const whatsapp = whatsappClients.get(clientId);
        if(whatsapp == undefined){
            return {"error": "client is not exist or not activate"}
        }

        let remoteId = await whatsapp.getNumberId(wppNumber)
        if(remoteId == undefined){
            return {"error": "number is not registered on whatsapp"}
        }
        remoteId = remoteId._serialized


        const newTemplateMessage = new TemplateMessageModel({...templateBody, clientId, remoteId});
        // await newTemplateMessage.save()
        
        const content = newTemplateMessage.content as ITemplateMessage['content'];
        let response

        if (content && content.mimeType && content.media) {
            const messageMedia = new MessageMedia(content.mimeType, content.media);
            response = await whatsapp.sendMessage(remoteId, messageMedia, {"sendAudioAsVoice": true, "caption": content.message});
        }
        else {
            console.log("Tentando enviar mensagem ->!!!")
            response = await whatsapp.sendMessage(remoteId, content.message);
            console.log("REsPONSE  ->", response)
        }
        
        newTemplateMessage.content
        return response;
    } catch (e: any) {
        console.log("[createTemplate ERROR] =>  ", e);
        throw e;
    }
}

const analyzeMessageTemplate = async (clientId: string, wppNumber: string, templateName: string) => {
    try {
        const whatsapp = whatsappClients.get(clientId);
        if (!whatsapp) {
            return { error: "Client does not exist or is not activated" };
        }

        const findParams: any = { clientId };

        if (wppNumber) {
            const remoteId = await whatsapp.getNumberId(wppNumber);
            if (!remoteId) {
                return { error: "Number is not registered on WhatsApp" };
            }
            findParams.remoteId = remoteId._serialized;
        }

        if (templateName) {
            findParams['template.name'] = templateName;
        }

        const response = await TemplateMessageModel.find(findParams);
        return response;

    } catch (e: any) {
        console.log("[getUser ERROR] =>  ", e);
        throw e;
    }
}

const changeTemplates = async (templateId: string, templateBody: object) => {
    try {
        const response = await TemplateModel.findOneAndUpdate({ _id: templateId }, templateBody);
        return response;

    } catch (e: any) {
        console.log("[changeUser ERROR] =>  ", e);
        throw e;
    }
}


const deleteTemplates = async (templateId: string) => {
    try {
        const response = await TemplateModel.deleteOne({ _id: templateId });
        return response;

    } catch (e: any) {
        console.log("ERROR -> ", e);
    }
}

const TemplatesService = {
    getTemplates,
    createTemplate,
    sendMessageTemplate,
    analyzeMessageTemplate,
    changeTemplates,
    deleteTemplates
}

export default TemplatesService; 