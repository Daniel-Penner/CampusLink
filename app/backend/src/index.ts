import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Set the strictQuery option to suppress warnings
mongoose.set('strictQuery', false);

// Connect to MongoDB
const databaseUrl = process.env.DATABASE_URL || 'mongodb://root:rootpassword@mongo:27017/campuslink_db?authSource=admin';

mongoose.connect(databaseUrl)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err.message);
    });

app.use(express.json());

// Your routes go here
import authRoutes from './routes/auth';
app.use('/api/auth', authRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
