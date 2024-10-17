import mongoose, { Document, Schema } from 'mongoose';

export const templateMessageSchema: Schema = new Schema({
    content: {
        message: { type: String, required: true },
        mimeType: { type: String, required: false },
        media: { type: String, required: false }
    },
    template: {
        name: { type: String, required: true },
        subName: { type: String, required: true },
    },
    clientId: { type: String, required: true, unique: false  },
    remoteId : { type: String, required: true, unique: false  },
});

export interface ITemplateMessage extends Document {
    content: {
        message: string
        mimeType: string
        media: string
    }
    template: {
        name: string,
        subName: string,
    }
    clientId: string;
    remoteId: string;
}

const TemplateMessageModel = mongoose.model('Template_Messages', templateMessageSchema);

export default TemplateMessageModel;