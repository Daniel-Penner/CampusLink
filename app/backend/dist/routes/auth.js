"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
const SendEmails_1 = require("../utils/SendEmails");
const Emails_1 = require("../data/Emails");
const router = express_1.default.Router();
dotenv_1.default.config();
// Register User
router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password, verified } = req.body;
    try {
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newUser = new User_1.default({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            verified,
        });
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        newUser.verificationToken = verificationToken;
        newUser.verificationExpires = new Date(Date.now() + 3600000);
        await newUser.save();
        const verificationLink = `http://localhost/verify-email/${verificationToken}`;
        const subject = 'Verify Your Email';
        const text = `To log in to the site, verify your email: ${verificationLink}`;
        const html = Emails_1.emailTemplates.verifyEmail(verificationLink, firstName);
        await (0, SendEmails_1.sendEmail)(email, subject, text, html);
        return res.status(201).json({ message: 'User registered successfully', user: newUser });
    }
    catch (error) {
        // Check if error is an instance of the Error class
        if (error instanceof Error) {
            console.error('Error registering user:', error.message);
            return res.status(500).json({ message: 'Internal server error' });
        }
        else {
            // Handle unknown error types
            console.error('Unexpected error:', error);
            return res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
});
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User_1.default.findOne({ email });
        if (user) {
            const isMatch = await bcryptjs_1.default.compare(password, user.password);
            if (isMatch) {
                if (user.verified) {
                    const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || 'your_jwt_secret', // Make sure to store the secret in .env
                    { expiresIn: '1h' } // Token expires in 1 hour
                    );
                    return res.status(200).json({
                        message: 'login successful',
                        token,
                        user: {
                            firstName: user.firstName,
                            lastName: user.lastName,
                        },
                    });
                }
                else {
                    return res.status(401).json({ message: 'This account is not yet verified' });
                }
            }
            else {
                return res.status(401).json({ message: 'This password is incorrect' });
            }
        }
        else {
            return res.status(401).json({ message: 'This account does not exist' });
        }
    }
    catch (_a) {
        return res.status(500).json({ message: 'An unexpected error occurred' });
    }
});
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        console.log("looking for user");
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User with this email does not exist' });
        }
        console.log("generating token");
        // Generate a reset token
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000);
        console.log("giving user token");
        await user.save();
        // Check if we are reaching this point
        console.log('Preparing to send email to:', user.email);
        // Send the email with the reset link
        const resetLink = `http://localhost/new-password/${resetToken}`;
        const subject = 'Password Reset Request';
        const text = `You requested a password reset. Click this link to reset your password: ${resetLink}`;
        const html = Emails_1.emailTemplates.passwordReset(resetLink);
        console.log('Request body:', req.body); // Check if email is being received properly
        // Add a log before calling sendEmail
        console.log('Calling sendEmail function...');
        await (0, SendEmails_1.sendEmail)(user.email, subject, text, html);
        return res.json({ message: 'Password reset email sent successfully' });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Error in forgot-password route:', error.message);
        }
        else {
            console.error('Unexpected error:', error);
        }
        return res.status(500).json({ message: 'Server error' });
    }
});
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    try {
        const user = await User_1.default.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }, // Check if token is still valid
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
        user.password = await bcryptjs_1.default.hash(password, 10);
        user.resetPasswordToken = undefined; // Clear the reset token
        user.resetPasswordExpires = undefined; // Clear the token expiration
        await user.save();
        return res.status(200).json({ message: 'Password successfully reset' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
});
router.get('/verify-email/:token', async (req, res) => {
    const { token } = req.params;
    try {
        // Find the user with the provided token and ensure it's still valid
        const user = await User_1.default.findOne({
            verificationToken: token,
            verificationExpires: { $gt: Date.now() }, // Ensure the token hasn't expired
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
        // Verify the user's email and clear the token
        user.verified = true;
        user.verificationToken = undefined;
        user.verificationExpires = undefined;
        await user.save();
        // Redirect to the login page after successful verification
        return res.redirect('/login');
    }
    catch (error) {
        console.error('Error verifying email:', error);
        return res.status(500).json({ message: 'Server error. Please try again.' });
    }
});
exports.default = router;
