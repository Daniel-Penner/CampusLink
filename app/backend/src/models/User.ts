import mongoose, { Document, Schema } from 'mongoose';

export interface User extends Document {
    firstName: string;
    lastName: string;
    email: string;
    newEmail?: string;
    password: string;
    friendCode: string;
    profilePicture: string;
    bio?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    verificationToken?: string;
    verificationExpires?: Date;
    emailChangeToken?: string; // Token for email change verification
    emailChangeExpires?: Date; // Expiration for the email change token
    verified: boolean;
}

const UserSchema: Schema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    newEmail: { type: String },
    password: { type: String, required: true },
    friendCode: { type: String, unique: true, required: true },
    profilePicture: {
        type: String,
        required: true,
        default:
            '/uploads/profile_pictures/default-default-profile.png',
    },
    bio: { type: String, default: '' },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    verificationToken: { type: String },
    verificationExpires: { type: Date },
    emailChangeToken: { type: String }, // New field
    emailChangeExpires: { type: Date }, // New field
    verified: { type: Boolean, default: false },
});

const User = mongoose.model<User>('User', UserSchema);
export default User;
