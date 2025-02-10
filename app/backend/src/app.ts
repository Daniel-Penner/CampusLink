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
import path from 'path';
import queries from "./routes/queries";
import dashboardRoutes from './routes/dashboard';
import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";
dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.SITE_ADDRESS) {
    throw new Error('SITE_ADDRESS is not set in the environment variables.');
}

// Create an Express app and an HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO server
const io = new SocketIOServer(server, {
    cors: {
        origin: process.env.SITE_ADDRESS,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    },
});

//socket
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a personal room for direct messages
    socket.on('join', (userId) => {
        console.log(`User ${userId} joined room ${userId}`);
        socket.join(userId);
    });

    // Handle Call Signaling
    socket.on("call-user", ({ caller, recipient, offer }) => {
        console.log(`User ${caller} is calling ${recipient}`);
        console.log("Offer details:", offer);

        io.to(recipient).emit("incoming-call", { caller, offer });
    });

    socket.on('answer-call', ({ caller, answer }) => {
        console.log(`User answering call from ${caller}`);
        io.to(caller).emit('call-answered', { answer });
    });

    socket.on('ice-candidate', ({ recipient, candidate }) => {
        console.log(`ICE Candidate sent to ${recipient}`);
        io.to(recipient).emit('ice-candidate', { candidate });
    });

    socket.on('end-call', ({ recipient }) => {
        io.to(recipient).emit('call-ended');
    });

    socket.on("call-rejected", ({ caller }) => {
        if (!caller) {
            console.error("Call rejection received without a caller.");
            return;
        }

        console.log(`User ${caller} rejected the call.`);
        io.to(caller).emit("call-rejected", { caller });
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
        origin: process.env.SITE_ADDRESS,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    })
);

// Static middleware
staticMiddleware(app);

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Define routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/direct-messages', directMessagesRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/queries', queries);
app.use('/api/dashboard', dashboardRoutes);

export { app, server, io }; // Export app, server, and io
