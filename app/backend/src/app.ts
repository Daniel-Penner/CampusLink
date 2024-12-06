import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import staticMiddleware from './middleware/staticMiddleware';
import authRoutes from './routes/auth';
import directMessagesRoutes from './routes/direct-messages';
import connectionRoutes from './routes/connections';
import serverRoutes from './routes/servers';
import userRoutes from './routes/users';
import locationRoutes from './routes/locations';

// Create an Express app and an HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO server
const io = new SocketIOServer(server, {
    cors: {
        origin: 'https://localhost',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    },
});

// Setup Socket.IO events
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a personal room for direct messages
    socket.on('join', (userId) => {
        console.log(`User ${userId} joined room ${userId}`);
        socket.join(userId);
    });

    // Join a server channel
    socket.on('join-channel', (channelId) => {
        console.log(`User joined channel: ${channelId}`);
        socket.join(channelId);
    });

    // Leave a server channel
    socket.on('leave-channel', (channelId) => {
        console.log(`User left channel: ${channelId}`);
        socket.leave(channelId);
    });

    // Broadcast a message to a specific channel
    socket.on('send-channel-message', (message) => {
        const { channel } = message;
        io.to(channel).emit('channel-message', message);
        console.log(`Message sent to channel ${channel}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Augment Express Request to include io
declare global {
    namespace Express {
        interface Request {
            io: SocketIOServer;
        }
    }
}

// Middleware to attach io to the req object
app.use((req: Request, res: Response, next: NextFunction) => {
    req.io = io;
    next();
});

// Middleware setup
app.use(express.json());
app.use(
    cors({
        origin: 'https://localhost',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    })
);

// Static middleware
staticMiddleware(app);

// Define routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/direct-messages', directMessagesRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/locations', locationRoutes);

export { app, server, io }; // Export app, server, and io
