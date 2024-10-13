import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import crypto from 'crypto';
import dotenv from 'dotenv';
import {sendEmail} from "../utils/SendEmails";

const router = express.Router();

dotenv.config();

// Register User
router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        return res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        // Check if error is an instance of the Error class
        if (error instanceof Error) {
            console.error('Error registering user:', error.message);
            return res.status(500).json({ message: 'Internal server error' });
        } else {
            // Handle unknown error types
            console.error('Unexpected error:', error);
            return res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                const token = jwt.sign(
                    { userId: user._id, email: user.email },
                    process.env.JWT_SECRET || 'your_jwt_secret', // Make sure to store the secret in .env
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
            } else {
                return res.status(401).json({ message: 'This password is incorrect' });
            }
        } else {
            return res.status(401).json({ message: 'This account does not exist' });
        }
    } catch {
        return res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        console.log("looking for user")
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User with this email does not exist' });
        }

        console.log("generating token")

        // Generate a reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000);

        console.log("giving user token")

        await user.save();

        // Check if we are reaching this point
        console.log('Preparing to send email to:', user.email);

        // Send the email with the reset link
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        const subject = 'Password Reset Request';
        const text = `You requested a password reset. Click this link to reset your password: ${resetLink}`;
        const html = `<p>You requested a password reset. Click this link to reset your password:</p><a href="${resetLink}">${resetLink}</a>`;

        console.log('Request body:', req.body); // Check if email is being received properly

        // Add a log before calling sendEmail
        console.log('Calling sendEmail function...');

        return await sendEmail(user.email, subject, text, html);
        //return res.json({ message: 'Password reset email sent successfully' });

    } catch (error) {
        if (error instanceof Error) {
            console.error('Error in forgot-password route:', error.message);
        } else {
            console.error('Unexpected error:', error);
        }
        return res.status(500).json({ message: 'Server error' });
    }
});


export default router;
