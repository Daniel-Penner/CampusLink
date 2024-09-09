import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',  // Allow requests from the frontend port
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use(express.json()); // To parse JSON request bodies

app.use('/api/auth', authRoutes);

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});

export default app;  // Correct ES module export
