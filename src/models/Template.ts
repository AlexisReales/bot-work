import mongoose, { Document, Schema } from 'mongoose';

export const templateSchema: Schema = new Schema({
    content: {
        message: { type: String, required: false },
        mimeType: { type: String, required: false },
        media: { type: String, required: true }
    },
    template: {
        name: { type: String, required: true },
        subName: { type: String, required: true },
    },
    userId: { type: String, required: true, unique: false  }
});

templateSchema.index({'userId': 1, 'template': 1 }, { unique: true });

export interface ITemplate extends Document {
    content: {
        message: String
        mimeType: String
        media: String
    }
    template: {
        name: String,
        subName: String,
    }
    clientId: String;
}

const TemplateModel = mongoose.model('Template', templateSchema);

export default TemplateModel;