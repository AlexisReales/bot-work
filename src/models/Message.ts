import mongoose, { Document, Schema, Model } from 'mongoose';

export const messageSchema: Schema = new Schema({
    ack: { type: Number, required: true },
    body: { type: String, required: false },
    deviceType: { type: String, required: true },
    forwardingScore: { type: Number, required: true },
    from: { type: String, required: true },
    fromMe: { type: Boolean, required: true },
    hasMedia: { type: Boolean, required: true },
    hasQuotedMsg: { type: Boolean, required: true },
    hasReaction: { type: Boolean, required: true },
    id: { type: Object, required: true },
    isForwarded: { type: Boolean, required: false },
    isGif: { type: Boolean, required: true },
    isStarred: { type: Boolean, required: false },
    isStatus: { type: Boolean, required: true },
    links: { type: Array, required: false },
    mentionedIds: { type: Array, required: false },
    timestamp: { type: Number, required: true },
    to: { type: String, required: true },
    type: { type: String, required: true },
    vCards: { type: Array, required: false },
    isTemplate: { type: Boolean, required: false, default: false },
    template: { type: Object, required: false, default: null },
});

const MessageModel = mongoose.model('Message', messageSchema);

export default MessageModel;
