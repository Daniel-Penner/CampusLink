import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
npx prisma db pull
app.use(express.json());

// Add a new user (this could be for registration purposes)
app.post('/users', async (req: Request, res: Response) => {
    const { firstName, lastName, email, password } = req.body;
    try {
        const user = await prisma.user.create({
            data: { firstName, lastName, email, password },
        });
        res.json(user);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.send('Backend is running');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
