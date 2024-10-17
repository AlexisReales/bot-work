import mongoose, { Document, Schema } from 'mongoose';
import { v4 } from 'uuid';

export const clientSchema: Schema = new Schema({
    userId: { type: String, required: true, unique: false },
    wppNumber: { type: String, required: true, unique: true, default: v4() },
    name: { type: String, required: true, unique: false },
});

export interface IClient extends Document {
    userId: string;
    wppNumber: string;
    name: string;
}

const ClientModel = mongoose.model('Client', clientSchema);

export default ClientModel;