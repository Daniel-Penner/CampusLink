import mongoose, { Document, Schema } from 'mongoose';

// Define an interface for your User model
interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
}

// Define the User schema
const UserSchema: Schema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
});

// Create and export the User model
const User = mongoose.model<IUser>('User', UserSchema);
export default User;