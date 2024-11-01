"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Connection_1 = __importDefault(require("../models/Connection"));
const User_1 = __importDefault(require("../models/User"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = express_1.default.Router();
// Add Friend Route
router.post('/add', authMiddleware_1.default, async (req, res) => {
    const { friendCode } = req.body;
    const senderId = req.user.userId;
    try {
        const sender = await User_1.default.findById(senderId);
        if (!sender) {
            return res.status(404).json({ message: 'Sender not found' });
        }
        const recipient = await User_1.default.findOne({ friendCode });
        if (!recipient) {
            return res.status(404).json({ message: 'User with this friend code not found' });
        }
        const existingConnection = await Connection_1.default.findOne({
            $or: [
                { sender: sender._id, recipient: recipient._id },
                { sender: recipient._id, recipient: sender._id }
            ]
        });
        if (existingConnection) {
            return res.status(400).json({ message: 'Connection already exists or a request has already been sent' });
        }
        const newConnection = new Connection_1.default({
            sender: sender._id,
            recipient: recipient._id,
            accepted: false
        });
        await newConnection.save();
        return res.status(201).json({ message: 'Friend request sent successfully' });
    }
    catch (error) {
        console.error('Error adding friend:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});
router.post('/delete', authMiddleware_1.default, async (req, res) => {
    const { user2Id } = req.body;
    const user1Id = req.user.userId;
    try {
        const existingConnection = await Connection_1.default.findOne({
            $or: [
                { sender: user1Id, recipient: user2Id },
                { sender: user2Id, recipient: user1Id }
            ]
        });
        if (!existingConnection) {
            return res.status(400).json({ message: 'Connection does not exist' });
        }
        await existingConnection.remove();
        return res.status(201).json({ message: 'Connection Deleted successfully' });
    }
    catch (error) {
        console.error('Error removing connection:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});
router.post('/accept', authMiddleware_1.default, async (req, res) => {
    const { user2Id } = req.body;
    const user1Id = req.user.userId;
    try {
        const existingConnection = await Connection_1.default.findOne({
            $or: [
                { sender: user1Id, recipient: user2Id },
                { sender: user2Id, recipient: user1Id }
            ]
        });
        if (!existingConnection) {
            return res.status(400).json({ message: 'Connection does not exist' });
        }
        existingConnection.accepted = true;
        await existingConnection.save();
        return res.status(201).json({ message: 'Friend request accepted successfully!' });
    }
    catch (error) {
        console.error('Error accepting request:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});
router.get('/friends', authMiddleware_1.default, async (req, res) => {
    const userId = req.user.userId;
    try {
        // Find all accepted connections where you are either the sender or the recipient
        const acceptedConnections = await Connection_1.default.find({
            $or: [
                { sender: userId, accepted: true },
                { recipient: userId, accepted: true }
            ]
        }).populate('sender recipient', 'firstName lastName email friendCode'); // Populate user details
        return res.status(200).json(acceptedConnections);
    }
    catch (error) {
        console.error('Error fetching accepted friends:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});
router.get('/sent-pending', authMiddleware_1.default, async (req, res) => {
    const userId = req.user.userId;
    try {
        // Find all pending friend requests where you are the sender
        const pendingSentRequests = await Connection_1.default.find({
            sender: userId,
            accepted: false
        }).populate('recipient', 'firstName lastName email friendCode'); // Populate recipient details
        return res.status(200).json(pendingSentRequests);
    }
    catch (error) {
        console.error('Error fetching pending friend requests you sent:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});
router.get('/received-pending', authMiddleware_1.default, async (req, res) => {
    const userId = req.user.userId;
    try {
        // Find all pending friend requests where you are the recipient
        const pendingReceivedRequests = await Connection_1.default.find({
            recipient: userId,
            accepted: false
        }).populate('sender', 'firstName lastName email friendCode'); // Populate sender details
        return res.status(200).json(pendingReceivedRequests);
    }
    catch (error) {
        console.error('Error fetching pending friend requests sent to you:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});
exports.default = router;
