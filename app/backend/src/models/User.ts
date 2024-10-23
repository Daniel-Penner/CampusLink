import mongoose, { Document, Schema } from 'mongoose';

export interface User extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    verificationToken?: string;
    verificationExpires?: Date;
    verified: boolean;
    friendCode: string;
}

const UserSchema: Schema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    verificationToken: { type: String },
    verificationExpires: { type: Date },
    verified: { type: Boolean, default: false },
    friendCode: { type: String, unique: true, required: true },
});

const User = mongoose.model<User>('User', UserSchema);
export default User;
