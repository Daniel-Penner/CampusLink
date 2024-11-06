import mongoose, { Schema, Document } from 'mongoose';
import { User } from './User';
import { IChannel } from './Channel';

export interface IServer extends Document {
    name: string;
    owner: User['_id'];
    members: User['_id'][];
    channels: IChannel['_id'][];
    public: boolean;
}

const ServerSchema: Schema = new Schema({
    name: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    channels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }],
    public: { type: Boolean, default: true } // Adding the public field with a default value
});


const Server = mongoose.model<IServer>('Server', ServerSchema);
export default Server;
