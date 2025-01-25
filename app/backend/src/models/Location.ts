import mongoose, { Schema, Document } from 'mongoose';

export interface ILocation extends Document {
    name: string;
    description: string;
    lat: number;
    lng: number;
    rating: number;
    reviews: {
        rating: number;
        text: string;
    }[];
    owner: mongoose.Types.ObjectId; // User who created the location
    image?: string; // Optional image URL
}

const LocationSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    reviews: [
        {
            rating: { type: Number, required: true },
            text: { type: String, required: true },
        },
    ],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    image: { type: String },
});

const Location = mongoose.model<ILocation>('Location', LocationSchema);
export default Location;
