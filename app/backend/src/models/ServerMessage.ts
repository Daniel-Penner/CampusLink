import mongoose, { Schema, Document } from 'mongoose';
import { User } from './User';
import { IChannel } from './Channel';

export interface IServerMessage extends Document {
    sender: User['_id'];
    channel: IChannel['_id'];
    content: string;
    timestamp: Date;
}

const ServerMessageSchema: Schema = new Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    channel: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true }, // Reference to the Channel where the message is sent
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const ServerMessage = mongoose.model<IServerMessage>('ServerMessage', ServerMessageSchema);
export default ServerMessage;
