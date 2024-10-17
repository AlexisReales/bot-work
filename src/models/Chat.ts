import mongoose, { Document, Schema, Model } from 'mongoose';
import { messageSchema } from './Message';

const chatSchema: Schema = new Schema({
    clientId: { type: String, required: true, unique: false },
    remoteId: { type: String, required: true, unique: false },
    contactName: { type: String, required: false }, // Novo campo para o nome do contato
    isGroup: { type: Boolean, required: true, unique: false, default: false },
    labels: { type: Array, required: false, unique: false },
    messages: [messageSchema], // Nested array of messages
});

const ChatModel = mongoose.model('Chat', chatSchema);

export default ChatModel;
