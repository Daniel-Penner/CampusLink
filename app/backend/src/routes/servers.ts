import express from 'express';
import Server from '../models/Server';
import Channel from '../models/Channel';
import ServerMessage from '../models/ServerMessage';
import authenticateToken from '../middleware/authMiddleware';
import mongoose from "mongoose";

const router = express.Router();

router.post('/create', authenticateToken, async (req, res) => {
    const { name, isPublic, channels } = req.body;
    const userId = req.user.userId;

    try {
        // Create the server
        const newServer = new Server({
            name,
            owner: userId,
            public: isPublic,
            members: [userId]
        });

        // Save the server
        await newServer.save();

        // Create channels and add to the server
        const createdChannels = await Promise.all(
            channels.map(async (channelData: { name: string }) => {
                const newChannel = new Channel({ name: channelData.name, server: newServer._id });
                await newChannel.save();
                newServer.channels.push(newChannel._id);
                return newChannel;
            })
        );

        // Save the server with updated channels
        await newServer.save();

        // Populate channels for the response
        const populatedServer = await Server.findById(newServer._id).populate('channels');

        res.status(201).json(populatedServer);
    } catch (error) {
        console.error('Error creating server:', error);
        res.status(500).json({ message: 'Error creating server' });
    }
});

router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const servers = await Server.find({ members: userId }).populate('channels');
        res.status(200).json(servers);
    } catch (error) {
        console.error('Error fetching servers:', error);
        res.status(500).json({ message: 'Error fetching servers' });
    }
});

// Join a Server
router.post('/join', authenticateToken, async (req, res) => {
    const { serverId } = req.body;
    const userId = req.user.userId;

    try {
        const server = await Server.findById(serverId);
        if (!server) {
            console.error(`Server with ID ${serverId} not found`);
            return res.status(404).json({ message: 'Server not found' });
        }

        if (server.members.includes(userId)) {
            return res.status(400).json({ message: 'Already a member of this server' });
        }

        server.members.push(userId);
        await server.save();

        return res.status(201).json({ message: 'Successfully joined the server' });
    } catch (error) {
        console.error('Error joining server:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// Get Channels from a Server
router.get('/:serverId/channels', authenticateToken, async (req, res) => {
    const { serverId } = req.params;

    try {
        const server = await Server.findById(serverId).populate('channels');
        if (!server) {
            console.error(`Server with ID ${serverId} not found`);
            return res.status(404).json({ message: 'Server not found' });
        }

        return res.status(200).json(server.channels);
    } catch (error) {
        console.error('Error fetching channels:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// Get Members in a Server
router.get('/:serverId/members', authenticateToken, async (req, res) => {
    const { serverId } = req.params;

    try {
        const server = await Server.findById(serverId).populate('members', 'firstName lastName email profilePicture');
        if (!server) {
            console.error(`Server with ID ${serverId} not found`);
            return res.status(404).json({ message: 'Server not found' });
        }

        return res.status(200).json(server.members);
    } catch (error) {
        console.error('Error fetching server members:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

router.get('/:serverId/channels/:channelId/messages', authenticateToken, async (req, res) => {
    const { channelId } = req.params;

    try {
        console.log(`Fetching messages for channel ID: ${channelId}`);

        // Convert channelId to ObjectId
        const objectIdChannelId = new mongoose.Types.ObjectId(channelId);

        const channel = await Channel.findById(objectIdChannelId).populate('messages');

        if (!channel) {
            console.error(`Channel with ID ${channelId} not found`);
            return res.status(404).json({ message: 'Channel not found' });
        }

        console.log(`Messages retrieved: ${channel.messages.length}`);
        return res.status(200).json(channel.messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// Send a new server message to a specific channel
router.post('/:serverId/channels/:channelId/message', authenticateToken, async (req, res) => {
    const { channelId } = req.params;
    const { sender, content, timestamp, profilePic } = req.body;

    try {
        console.log(`Attempting to send message to channel ID: ${channelId}`);
        console.log(`Payload received:`, { sender, content, timestamp, profilePic });

        // Convert channelId to ObjectId
        const objectIdChannelId = new mongoose.Types.ObjectId(channelId);

        // Create and save the new message
        const newMessage = new ServerMessage({ sender, content, timestamp, channel: objectIdChannelId, profilePic });
        await newMessage.save();

        // Find the channel and add the message reference
        const channel = await Channel.findById(objectIdChannelId);

        if (!channel) {
            console.error(`Channel with ID ${channelId} not found`);
            return res.status(404).json({ message: 'Channel not found' });
        }

        channel.messages.push(newMessage._id);
        await channel.save();

        console.log(`Message sent successfully. Message ID: ${newMessage._id}`);

        // Emit the new message to clients in the channel room
        req.io.to(channelId).emit('channel-message', newMessage);

        return res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

export default router;

