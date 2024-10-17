import express, { Router } from "express";
import TemplatesController from "../controllers/templates";

const router: Router = express.Router();


// GET 
router.get('/:userId', TemplatesController.getTemplates);
router.get('/:userId/:templateName', TemplatesController.getTemplates);



// POST 
router.post('/:userId', TemplatesController.createTemplates);
router.post('/sendMessageTemplate/:clientId/:wppNumber', TemplatesController.sendMessageTemplate)
router.post('/analyzeMessageTemplate/:clientId', TemplatesController.analyzeMessageTemplate);

// PUT
router.put('/:templateId', TemplatesController.changeTemplates);

// DELETE 
router.delete('/:templateId', TemplatesController.deleteTemplates);



export default router;