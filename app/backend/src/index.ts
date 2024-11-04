import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
    cors: {
        origin: 'https://localhost', // Replace with the correct frontend URL
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Setup Socket.IO events
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a personal room for direct messages
    socket.on('join', (userId) => {
        socket.join(userId);
    });

    // Join a server channel
    socket.on('join-channel', (channelId) => {
        socket.join(channelId);
        console.log(`User joined channel: ${channelId}`);
    });

    // Leave a server channel
    socket.on('leave-channel', (channelId) => {
        socket.leave(channelId);
        console.log(`User left channel: ${channelId}`);
    });

    // Broadcast a message to a specific channel
    socket.on('send-channel-message', (message) => {
        const { channel } = message;
        io.to(channel).emit('channel-message', message); // Send to all users in the channel
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
    origin: 'https://localhost',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Import and configure routes
import authRoutes from './routes/auth';
import directMessagesRoutes from './routes/direct-messages';
import connectionRoutes from './routes/connections';
import serverRoutes from './routes/servers'; // Import server routes

// Attach `io` to `req` object for usage in routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/direct-messages', directMessagesRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/servers', serverRoutes); // Add server routes

// Start the server
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
