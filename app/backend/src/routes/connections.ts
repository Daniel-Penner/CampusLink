import express from 'express';
import Connection from '../models/Connection';
import User from '../models/User';
import authenticateToken from '../middleware/authMiddleware';

const router = express.Router();

// Add Friend Route
router.post('/add', authenticateToken,async (req, res) => {
    const { friendCode } = req.body;
    const senderId = req.user.userId;

    try {
        const sender = await User.findById(senderId);

        if (!sender) {
            return res.status(404).json({ message: 'Sender not found' });
        }

        const recipient = await User.findOne({ friendCode });

        if (!recipient) {
            return res.status(404).json({ message: 'User with this friend code not found' });
        }

        const existingConnection = await Connection.findOne({
            $or: [
                { sender: sender._id, recipient: recipient._id },
                { sender: recipient._id, recipient: sender._id }
            ]
        });

        if (existingConnection) {
            return res.status(400).json({ message: 'Connection already exists or a request has already been sent' });
        }

        const newConnection = new Connection({
            sender: sender._id,
            recipient: recipient._id,
            accepted: false
        });

        await newConnection.save();

        return res.status(201).json({ message: 'Friend request sent successfully' });
    } catch (error) {
        console.error('Error adding friend:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

router.post('/delete', authenticateToken,async (req, res) => {
    const {user2Id} = req.body;
    const user1Id = req.user.userId;
    try {

        const existingConnection = await Connection.findOne({
            $or: [
                {sender: user1Id, recipient: user2Id},
                {sender: user2Id, recipient: user1Id}
            ]
        });

        if (!existingConnection) {
            return res.status(400).json({message: 'Connection does not exist'});
        }

        await existingConnection.remove();

        return res.status(201).json({ message: 'Connection Deleted successfully' });

    } catch (error) {
        console.error('Error removing connection:', error);
        return res.status(500).json({message: 'Server error. Please try again later.'});
    }
});

router.post('/accept', authenticateToken,async (req, res) => {
    const {user2Id} = req.body;
    const user1Id = req.user.userId;
    try {

        const existingConnection = await Connection.findOne({
            $or: [
                {sender: user1Id, recipient: user2Id},
                {sender: user2Id, recipient: user1Id}
            ]
        });

        if (!existingConnection) {
            return res.status(400).json({message: 'Connection does not exist'});
        }

        existingConnection.accepted = true;
        await existingConnection.save();

        return res.status(201).json({ message: 'Friend request accepted successfully!' });

    } catch (error) {
        console.error('Error accepting request:', error);
        return res.status(500).json({message: 'Server error. Please try again later.'});
    }
});


router.get('/friends', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        // Find all accepted connections where you are either the sender or the recipient
        const acceptedConnections = await Connection.find({
            $or: [
                { sender: userId, accepted: true },
                { recipient: userId, accepted: true }
            ]
        }).populate('sender recipient', 'firstName lastName email friendCode'); // Populate user details

        return res.status(200).json(acceptedConnections);
    } catch (error) {
        console.error('Error fetching accepted friends:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

router.get('/sent-pending', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        // Find all pending friend requests where you are the sender
        const pendingSentRequests = await Connection.find({
            sender: userId,
            accepted: false
        }).populate('recipient', 'firstName lastName email friendCode'); // Populate recipient details

        return res.status(200).json(pendingSentRequests);
    } catch (error) {
        console.error('Error fetching pending friend requests you sent:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

router.get('/received-pending', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        // Find all pending friend requests where you are the recipient
        const pendingReceivedRequests = await Connection.find({
            recipient: userId,
            accepted: false
        }).populate('sender', 'firstName lastName email friendCode'); // Populate sender details

        return res.status(200).json(pendingReceivedRequests);
    } catch (error) {
        console.error('Error fetching pending friend requests sent to you:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

export default router;
