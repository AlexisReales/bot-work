import express from 'express';
import { createQuickMessage, getQuickMessages, updateQuickMessage, deleteQuickMessage } from '../controllers/quickMessageController';

const router = express.Router();

router.post('/', createQuickMessage);
router.get('/:userId', getQuickMessages);
router.put('/:id', updateQuickMessage);
router.delete('/:id', deleteQuickMessage);

export default router;
