import mongoose, { Document, Schema } from 'mongoose';

export interface User extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    friendCode: string;
    profilePicture: string;
    bio?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    verificationToken?: string;
    verificationExpires?: Date;
    verified: boolean;
}

const UserSchema: Schema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    friendCode: { type: String, unique: true, required: true },
    profilePicture: {
        type: String,
        required: true,
        default:
            "C:\\Users\\danie\\OneDrive\\Documents\\GitHub\\CampusLink\\app\\frontend\\src\\assets\\profile.png",
    },
    bio: { type: String, default: '' },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    verificationToken: { type: String },
    verificationExpires: { type: Date },
    verified: { type: Boolean, default: false },
});

const User = mongoose.model<User>('User', UserSchema);
export default User;
