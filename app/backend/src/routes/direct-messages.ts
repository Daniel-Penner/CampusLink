import express from 'express';
import User from '../models/User';
import Message from '../models/Message';

const router = express.Router();

// Get all users with basic info (exclude password)
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('firstName lastName email');
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Get message history for a conversation between two users
router.get('/messages/:userId/:otherUserId', async (req, res) => {
    const { userId, otherUserId } = req.params;
    try {
        const messages = await Message.find({
            $or: [
                { sender: userId, recipient: otherUserId },
                { sender: otherUserId, recipient: userId }
            ]
        }).sort({ timestamp: 1 });
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching messages' });
    }
});

// Send a new message
router.post('/messages', async (req, res) => {
    const { sender, recipient, content, conversationId } = req.body;
    try {
        const newMessage = new Message({
            sender,
            recipient,
            content,
            conversationId
        });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ message: 'Error saving message' });
    }
});

export default router;
