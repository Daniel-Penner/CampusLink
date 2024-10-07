import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const router = express.Router();

import dotenv from 'dotenv';
dotenv.config();

// Define a User schema using Mongoose
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
});

// Create a User model based on the schema
const User = mongoose.model('User', userSchema);

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
                const token = 'your_jwt_token_here'; // Replace with actual JWT creation
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


export default router;
