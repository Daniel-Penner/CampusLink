"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = __importDefault(require("../models/User"));
const Message_1 = __importDefault(require("../models/Message"));
const router = express_1.default.Router();
// Get all users with basic info (exclude password)
router.get('/users', async (req, res) => {
    try {
        const users = await User_1.default.find().select('firstName lastName email');
        res.status(200).json(users);
    }
    catch (err) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});
// Get message history for a conversation between two users
router.get('/messages/:userId/:otherUserId', async (req, res) => {
    const { userId, otherUserId } = req.params;
    try {
        const messages = await Message_1.default.find({
            $or: [
                { sender: userId, recipient: otherUserId },
                { sender: otherUserId, recipient: userId }
            ]
        }).sort({ timestamp: 1 });
        res.status(200).json(messages);
    }
    catch (err) {
        res.status(500).json({ message: 'Error fetching messages' });
    }
});
// Send a new message
router.post('/messages', async (req, res) => {
    const { sender, recipient, content, conversationId } = req.body;
    try {
        const newMessage = new Message_1.default({
            sender,
            recipient,
            content,
            conversationId
        });
        await newMessage.save();
        res.status(201).json(newMessage);
    }
    catch (err) {
        res.status(500).json({ message: 'Error saving message' });
    }
});
exports.default = router;
