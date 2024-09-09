import express from 'express';
import authRoutes from './routes/auth';

require('dotenv').config();

const app = express();

app.use(express.json());

app.use(express.json()); // To parse JSON request bodies

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

console.log(app.routes)

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));