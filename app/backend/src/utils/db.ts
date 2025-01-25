import mongoose from 'mongoose';

export const connectToDatabase = async (dbUri: string) => {
    try {
        await mongoose.connect(dbUri, { dbName: 'main' });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', (err as Error).message);
        throw err;
    }
};

export const disconnectFromDatabase = async () => {
    try {
        await mongoose.connection.close();
        console.log('Disconnected from MongoDB');
    } catch (err) {
        console.error('Error disconnecting from MongoDB:', (err as Error).message);
        throw err;
    }
};
