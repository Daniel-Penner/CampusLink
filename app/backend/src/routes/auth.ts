import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Import environment variables from .env
import dotenv from 'dotenv';
dotenv.config();

// Get JWT_SECRET from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'yourSecretKey';

// Register User
router.post('/register-user', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

});

// Register Employer
router.post('/register-employer', async (req, res) => {
    const { companyName, email, password } = req.body;

});

// Login User
router.post('/login-user', async (req, res) => {
    const { email, password } = req.body;

});

// Login Employer
router.post('/login-employer', async (req, res) => {
    const { email, password } = req.body;

});

export default router;