import express from 'express';
import User from '../models/User';
import Message from '../models/Message';
import authenticateToken from "../middleware/authMiddleware";
import Connection from "../models/Connection";


const router = express.Router();

// Endpoint to get messageable friends
// Endpoint to get messageable friends
router.get('/messageable-friends', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        const connections = await Connection.find({
            $or: [
                { sender: userId, accepted: true },
                { recipient: userId, accepted: true }
            ]
        }).populate('sender recipient', 'firstName lastName email profilePicture');

        // Use a Map to ensure unique users
        const messageableFriendsMap = new Map();

        connections.forEach(connection => {
            const friend = connection.sender._id.toString() === userId
                ? connection.recipient
                : connection.sender;

            // Avoid duplicate users
            if (!messageableFriendsMap.has(friend._id.toString())) {
                messageableFriendsMap.set(friend._id.toString(), {
                    _id: friend._id,
                    firstName: friend.firstName,
                    lastName: friend.lastName,
                    email: friend.email,
                    profilePicture: friend.profilePicture || 'default-profile-pic.png',
                });
            }
        });

        const messageableFriends = Array.from(messageableFriendsMap.values());

        return res.status(200).json(messageableFriends);
    } catch (error) {
        console.error('Error fetching messageable friends:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});


// Endpoint to get message history between two users
router.get('/messages/:userId/:otherUserId', authenticateToken, async (req, res) => {
    const { userId, otherUserId } = req.params;

    try {
        const messages = await Message.find({
            $or: [
                { sender: userId, recipient: otherUserId },
                { sender: otherUserId, recipient: userId }
            ]
        }).sort({ timestamp: 1 });

        // Mark messages as read
        await Message.updateMany(
            { sender: otherUserId, recipient: userId, isRead: false },
            { $set: { isRead: true } }
        );

        // Reset unread count for the connection
        await Connection.findOneAndUpdate(
            { sender: otherUserId, recipient: userId },
            { $set: { unreadCount: 0 } }
        );

        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching messages' });
    }
});


// Endpoint to send a new message
router.post('/message', authenticateToken, async (req, res) => {
    const { sender, recipient, content, timestamp } = req.body;

    try {
        const newMessage = new Message({
            sender,
            recipient,
            content,
            timestamp,
            isRead: false // Initially unread
        });

        await newMessage.save();

        console.log(`Emitting message to rooms: ${recipient}, ${sender}`);
        req.io.to(recipient).emit('new-message', newMessage);

        // ✅ Check if recipient is currently chatting with the sender
        const activeUsers = req.io.sockets.adapter.rooms.get(recipient);
        if (activeUsers) {
            console.log(`User ${recipient} is active, marking message as read.`);
            await Message.updateOne(
                { _id: newMessage._id },
                { $set: { isRead: true } }
            );
        } else {
            // Increment unread count for offline users
            await Connection.updateOne(
                { sender, recipient },
                { $inc: { unreadCount: 1 } },
                { upsert: true }
            );
        }

        res.status(201).json(newMessage);
    } catch (err) {
        console.error('Error saving message:', err);
        res.status(500).json({ message: 'Error saving message' });
    }
});




export default router;
