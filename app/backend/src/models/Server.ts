import mongoose, { Schema, Document } from 'mongoose';
import { User } from './User';
import { IChannel } from './Channel';

export interface IServer extends Document {
    name: string;
    owner: User['_id'];
    members: User['_id'][];
    channels: IChannel['_id'][];
}

const ServerSchema: Schema = new Schema({
    name: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of User IDs for members
    channels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }] // Array of Channel IDs
});

const Server = mongoose.model<IServer>('Server', ServerSchema);
export default Server;
