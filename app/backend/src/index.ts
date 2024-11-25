import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { app, server } from './app';

dotenv.config();

const port = process.env.PORT || 5000;

// Connect to the database
const databaseUrl =
    process.env.DATABASE_URL || 'mongodb://root:rootpassword@mongo:27017/campuslink_db?authSource=admin';

const connectToDatabase = async () => {
    try {
        await mongoose.connect(databaseUrl, { dbName: 'campuslink_db' });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1); // Exit if unable to connect
    }
};

// Start the server
(async () => {
    await connectToDatabase();
    server.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
})();
