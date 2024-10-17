import {Request, Response } from "express";
import ContactsService from "../services/contacts";

const getContacts = async(req: Request, res: Response) => {
    try {
        const ContactId = req.params.ContactId;
        const response = await ContactsService.getContacts(ContactId);
        res.send(response);
    } catch (e: any) {
        res.status(500).send(e.toString());
    }
}

const createContacts = async(req: Request, res: Response) => {
    try {
        const reqBody = req.body;
        const response = await ContactsService.createContact(reqBody);
        res.send(response);
    } catch (e: any) {
        res.status(500).send(e.toString());
    }
}

const changeContacts = async(req: Request, res: Response) => {
    try {
        const ContactId = req.params.ContactId;
        const response = await ContactsService.changeContacts(ContactId);
        res.send(response);
    } catch (e: any) {
        res.status(500).send(e.toString());
    }
}

const deleteContacts = async(req: Request, res: Response) => {
    try {
        const ContactId = req.params.ContactId;
        const response = await ContactsService.deleteContacts(ContactId);
        res.send(response);
    } catch (e: any) {
        res.status(500).send(e.toString());
    }
}

const ContactsController = {
    getContacts,
    createContacts,
    changeContacts,
    deleteContacts
}

export default ContactsController;