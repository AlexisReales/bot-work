import express, { Router } from "express";
import GroupController from "../controllers/groups";

const router: Router = express.Router();


// GET /groups
router.get('/:clientId', GroupController.getGroups);
router.get('/:clientId/:remoteId', GroupController.getGroups);
router.get('/labels/:clientId/:remoteId', GroupController.getLabels);

// POST /groups
router.post('/:clientId', GroupController.createGroups);
router.post('/labels/:clientId/:remoteId', GroupController.addLabels);
router.post('/invites/get', GroupController.getInvites);

// PUT /groups
router.put('/:clientId', GroupController.updateGroups);

// DELETE /groups
router.delete('/:clientId/:remoteId', GroupController.deleteGroups);
router.delete('/labels/:clientId/:remoteId', GroupController.deleteLabels);


export default router;