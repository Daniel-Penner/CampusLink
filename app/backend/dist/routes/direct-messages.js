"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Message_1 = __importDefault(require("../models/Message"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const Connection_1 = __importDefault(require("../models/Connection"));
const router = express_1.default.Router();
// Endpoint to get messageable friends
router.get('/messageable-friends', authMiddleware_1.default, async (req, res) => {
    const userId = req.user.userId;
    try {
        const connections = await Connection_1.default.find({
            $or: [
                { sender: userId, accepted: true },
                { recipient: userId, accepted: true }
            ]
        }).populate('sender recipient', 'firstName lastName email profilePic');
        const messageableFriends = connections.map(connection => {
            const friend = connection.sender._id.toString() === userId
                ? connection.recipient
                : connection.sender;
            return {
                _id: friend._id,
                firstName: friend.firstName,
                lastName: friend.lastName,
                email: friend.email,
                profilePic: friend.profilePic || 'default-profile-pic.png',
            };
        });
        return res.status(200).json(messageableFriends);
    }
    catch (error) {
        console.error('Error fetching messageable friends:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});
// Endpoint to get message history between two users
router.get('/messages/:userId/:otherUserId', authMiddleware_1.default, async (req, res) => {
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
// Endpoint to send a new message
router.post('/message', authMiddleware_1.default, async (req, res) => {
    const { sender, recipient, content, timestamp, conversationId } = req.body;
    try {
        const newMessage = new Message_1.default({
            sender,
            recipient,
            content,
            timestamp,
            conversationId
        });
        await newMessage.save();
        // Emit the new message to the recipient’s room using `req.io`
        req.io.to(recipient).emit('new-message', newMessage);
        req.io.to(sender).emit('new-message', newMessage);
        res.status(201).json(newMessage);
    }
    catch (err) {
        res.status(500).json({ message: 'Error saving message' });
    }
});
exports.default = router;
