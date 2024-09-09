import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const router = express.Router();
const prisma = new PrismaClient();

import dotenv from 'dotenv';
dotenv.config();

// Register User
router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    console.log(firstName, lastName, email, password);

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword,
            },
        });

        return res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error registering user:', error.message);
            return res.status(500).json({ message: 'Internal server error' });
        } else {
            console.error('Unexpected error:', error);
            return res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
});

export default router;
