import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import staticMiddleware from './middleware/staticMiddleware';
import authRoutes from './routes/auth';
import directMessagesRoutes from './routes/direct-messages';
import connectionRoutes from './routes/connections';
import serverRoutes from './routes/servers';
import userRoutes from './routes/users';

const app = express();

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

export { app }; // Export the app for use in tests

export const server = http.createServer(app);
export const io = new SocketIOServer(server, {
    cors: {
        origin: 'https://localhost',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});
