import mongoose, { Schema, Document } from 'mongoose';
import { User } from './User';

interface Connection extends Document {
    sender: User['_id'];
    recipient: User['_id'];
    accepted: boolean;
    unreadCount: number;
}

const ConnectionSchema: Schema = new Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    accepted: { type: Boolean, required: true, default: false },
    unreadCount: { type: Number, required: true, default: 0 }
});

const Connection = mongoose.model<Connection>('Connection', ConnectionSchema);
export default Connection;
