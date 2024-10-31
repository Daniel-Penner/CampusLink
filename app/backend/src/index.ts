import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io'; // Import Socket.IO as SocketIOServer

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
    cors: {
        origin: 'https://localhost', // Set the correct frontend URL with HTTPS
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Setup Socket.IO events
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (userId) => {
        socket.join(userId);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Configure Mongoose
mongoose.set('strictQuery', false);
const databaseUrl = process.env.DATABASE_URL || 'mongodb://root:rootpassword@mongo:27017/campuslink_db?authSource=admin';

mongoose.connect(databaseUrl)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err.message);
    });

// Middleware setup
app.use(express.json());
app.use(cors({
    origin: 'https://localhost', // Match the HTTPS frontend URL here
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Import and configure routes
import authRoutes from './routes/auth';
import directMessagesRoutes from './routes/direct-messages';
import connectionRoutes from './routes/connections';

// Attach `io` to `req` object for usage in routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/direct-messages', directMessagesRoutes);
app.use('/api/connections', connectionRoutes);

// Start the server
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
