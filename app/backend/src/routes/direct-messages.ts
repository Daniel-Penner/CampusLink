import express from 'express';
import User from '../models/User';
import Message from '../models/Message';
import authenticateToken from "../middleware/authMiddleware";
import Connection from "../models/Connection";

const router = express.Router();

router.get('/messageable-friends', authenticateToken, async (req, res) => {
    const userId = req.user.userId; // Extract current user's ID from the authenticated token

    try {
        // Find all accepted connections where the current user is either the sender or the recipient
        const connections = await Connection.find({
            $or: [
                { sender: userId, accepted: true },
                { recipient: userId, accepted: true }
            ]
        }).populate('sender recipient', 'firstName lastName email profilePic'); // Populate the connected users

        // Process the connections to get the other user (the friend) in each connection
        const messageableFriends = connections.map(connection => {
            // Check if the current user is the sender or the recipient and return the other user
            const friend = connection.sender._id.toString() === userId
                ? connection.recipient
                : connection.sender;

            // Return the friend with necessary details
            return {
                _id: friend._id,
                firstName: friend.firstName,
                lastName: friend.lastName,
                email: friend.email,
                profilePic: friend.profilePic || 'default-profile-pic.png', // Provide a default if missing
            };
        });

        return res.status(200).json(messageableFriends);

    } catch (error) {
        console.error('Error fetching messageable friends:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// Get message history for a conversation between two users
router.get('/messages/:userId/:otherUserId', authenticateToken, async (req, res) => {
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
router.post('/message', authenticateToken, async (req, res) => {
    const { sender, recipient, content, timestamp, conversationId } = req.body;
    try {
        const newMessage = new Message({
            sender,
            recipient,
            content,
            timestamp,
            conversationId
        });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ message: 'Error saving message' });
    }
});

export default router;
