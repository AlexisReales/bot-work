import mongoose, { Schema } from 'mongoose';
import { messageSchema } from './Message';

const groupSchema: Schema = new Schema({
    clientId:       { type: String, required: true, unique: false },
    archived:       { type: Boolean, required: false, unique: false },
    createdAt:      { type: String, required: false, unique: false },
    description:    { type: String, required: false, unique: false },
    id:             { type: String, required: true, unique: false },
    isMuted:        { type: Boolean, required: false, unique: false },
    isReadOnly:     { type: Boolean, required: false, unique: false },
    lastMessage:    { type: messageSchema, required: false, unique: false },
    muteExpiration: { type: Number, required: false, unique: false },
    name:           { type: String, required: true, unique: false },
    owner:          { type: Object, required: true, unique: false },
    participants:   { type: Array, required: true, unique: false },
    pinned:         { type: Boolean, required: false, unique: false },
    timestamp:      { type: Number, required: true, unique: false },
    unreadCount:    { type: Number, required: false, unique: false },
    category:       { type: String, required: false, unique: false },
});

const GroupModel = mongoose.model('Group', groupSchema);

export default GroupModel;
