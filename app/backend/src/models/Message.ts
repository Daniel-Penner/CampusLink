import mongoose, { Schema, Document } from 'mongoose';
import { User } from './User';

export interface IMessage extends Document {
    sender: User['_id'];
    recipient: User['_id'];
    content: string;
    timestamp: Date;
}

const MessageSchema: Schema = new Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model<IMessage>('Message', MessageSchema);
export default Message;
