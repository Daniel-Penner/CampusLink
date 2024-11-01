"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io"); // Import Socket.IO as SocketIOServer
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
// Create an HTTP server
const server = http_1.default.createServer(app);
// Initialize Socket.IO
const io = new socket_io_1.Server(server, {
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
mongoose_1.default.set('strictQuery', false);
const databaseUrl = process.env.DATABASE_URL || 'mongodb://root:rootpassword@mongo:27017/campuslink_db?authSource=admin';
mongoose_1.default.connect(databaseUrl)
    .then(() => {
    console.log('Connected to MongoDB');
})
    .catch(err => {
    console.error('Error connecting to MongoDB:', err.message);
});
// Middleware setup
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: 'https://localhost', // Match the HTTPS frontend URL here
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
// Import and configure routes
const auth_1 = __importDefault(require("./routes/auth"));
const direct_messages_1 = __importDefault(require("./routes/direct-messages"));
const connections_1 = __importDefault(require("./routes/connections"));
// Attach `io` to `req` object for usage in routes
app.use((req, res, next) => {
    req.io = io;
    next();
});
app.use('/api/auth', auth_1.default);
app.use('/api/direct-messages', direct_messages_1.default);
app.use('/api/connections', connections_1.default);
// Start the server
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
