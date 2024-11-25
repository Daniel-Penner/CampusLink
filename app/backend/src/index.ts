import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { app, server } from './app';

dotenv.config();

const port = process.env.PORT || 5000;

// MongoDB connection URL
const databaseUrl =
    process.env.DATABASE_URL || 'mongodb://root:rootpassword@mongo:27017/campuslink_db?authSource=admin';

// Connect to the database
const connectToDatabase = async () => {
    try {
        await mongoose.connect(databaseUrl, { dbName: 'campuslink_db' });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err instanceof Error ? err.message : err);
        process.exit(1); // Exit the process if the database connection fails
    }
};

// Start the server
if (process.env.NODE_ENV !== 'test') {
    (async () => {
        await connectToDatabase();
        server.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })();
}
