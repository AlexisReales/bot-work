import mongoose, { Document, Schema, Model } from 'mongoose';

interface IQuickMessage extends Document {
  userId: string;
  title: string;
  text: string;
}

const quickMessageSchema: Schema = new Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  text: { type: String, required: true },
});

const QuickMessageModel = mongoose.model<IQuickMessage>('QuickMessage', quickMessageSchema);

export default QuickMessageModel;
