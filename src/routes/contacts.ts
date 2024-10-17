import express, { Router } from "express";
import ContactsController from "../controllers/contacts";

const router: Router = express.Router();


// GET /contacts
router.get('/:userId', ContactsController.getContacts);
router.get('/:userId/:wppNumber', ContactsController.getContacts);

// POST /contacts
router.post('/', ContactsController.createContacts);

// PUT /contacts
router.put('/:userId/:wppNumber', ContactsController.changeContacts);

// DELETE /contacts
router.delete('/:userId/:wppNumber', ContactsController.deleteContacts);


export default router;