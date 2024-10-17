import mongoose, { Document, Schema, Model } from 'mongoose';

const contactSchema: Schema = new Schema({
    userId: { type: String, required: true, unique: false },
    wppNumber: { type: String, required: true, unique: false },
    name: { type: String, required: false, unique: false },
    wppInfo: { type: Object, required: true, unique: false}
});

//Recive clientId for validate number, and save userId 
export interface IContact extends Document {
    clientId: string;
    userId: string;
    wppNumber: string;
    name: string;
    wppInfo: object;
}

const ContactModel = mongoose.model('Contact', contactSchema);

export default ContactModel;
