import ContactModel, { IContact } from "../models/Contact";
import clientService from "../services/clients"
import { whatsappClients } from "..";

const getContacts = async (ContactId: string) => {
    try {
        let response;
        if (ContactId) {
            response = await ContactModel.find({ _id: ContactId });
        } else {
            response = await ContactModel.find();
        }

        return response;

    } catch (e: any) {
        console.log("[getContact ERROR] =>  ", e);
        throw e;
    }
}

const createContact = async (reqBody: IContact) => {
    try {
        const clientId = reqBody.clientId
        const wppNumber = reqBody.wppNumber


        const whatsapp = whatsappClients.get(clientId);
        if(whatsapp == undefined){
            return {"error": "client is not exist or not activate"}
        }

        let formatedNumber = await whatsapp.getNumberId(wppNumber)
        if(formatedNumber == undefined){
            return {"error": "number is not registered on whatsapp"}
        }
        formatedNumber = formatedNumber._serialized

        
        const clientDataDb = await clientService.getClients(clientId)
        const contactInfo = await whatsapp.getContactById(formatedNumber)
 
        let objDb = reqBody
        objDb.userId = (clientDataDb[0].userId as string)
        objDb.wppNumber = formatedNumber
        objDb.wppInfo = contactInfo as object

        const newContact = new ContactModel(objDb);
        const savedContact = await newContact.save();
        return savedContact;
    } catch (e: any) {
        console.log("[createContact ERROR] =>  ", e);
        throw e;
    }
}

const changeContacts = async (ContactId: string) => {
    try {
        const response = await ContactModel.findOneAndUpdate({ ContactId: ContactId }, { upsert: true, new: true });
        return response;

    } catch (e: any) {
        console.log("[changeContact ERROR] =>  ", e);
        throw e;
    }
}


const deleteContacts = async (ContactId: string) => {
    try {
        const response = await ContactModel.deleteOne({ ContactId: ContactId });
        return response;

    } catch (e: any) {
        console.log("ERROR -> ", e);
    }
}

const MessageService = {
    getContacts,
    createContact,
    changeContacts,
    deleteContacts,
}

export default MessageService; 