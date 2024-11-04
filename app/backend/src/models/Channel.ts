import mongoose, { Schema, Document } from 'mongoose';
import { IServer } from './Server';
import { IServerMessage } from './ServerMessage';

export interface IChannel extends Document {
    name: string;
    server: IServer['_id'];
    messages: IServerMessage['_id'][]; // Reference to ServerMessage IDs
}

const ChannelSchema: Schema = new Schema({
    name: { type: String, required: true },
    server: { type: mongoose.Schema.Types.ObjectId, ref: 'Server', required: true },
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ServerMessage' }]
});

const Channel = mongoose.model<IChannel>('Channel', ChannelSchema);
export default Channel;
