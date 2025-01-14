import express from 'express';
import ServerMessage from '../models/ServerMessage';
import Server from '../models/Server';
import Location from '../models/Location';
import Message from '../models/Message'; // Direct messages model
import authenticateToken from '../middleware/authMiddleware';

const router = express.Router();

router.get('/info', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        // Fetch recent direct messages received by the user
        const recentMessages = await Message.find({ recipient: userId })
            .sort({ timestamp: -1 })
            .limit(5)
            .populate('sender', 'name'); // Populate sender's name

        // Fetch the server with the most recent activity
        const recentMessage = await ServerMessage.findOne()
            .sort({ timestamp: -1 })
            .populate('channel');
        let mostActiveServer = null;

        if (recentMessage && recentMessage.channel) {
            const server = await Server.findById(recentMessage.channel.server);
            if (server) {
                mostActiveServer = {
                    name: server.name,
                    lastActivity: recentMessage.timestamp,
                };
            }
        }

        // Fetch top-rated locations
        const topLocations = await Location.find()
            .sort({ rating: -1 })
            .limit(5)
            .select('name rating');

        res.status(200).json({
            recentMessages: recentMessages.map((msg) => ({
                content: msg.content,
                senderName: msg.sender?.name || 'Unknown',
                timestamp: msg.timestamp,
            })),
            mostActiveServer,
            topLocations: topLocations.map((location) => ({
                name: location.name,
                rating: location.rating,
            })),
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ message: 'Error fetching dashboard data.' });
    }
});

export default router;
