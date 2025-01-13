import express from 'express';
import Server from '../models/Server';
import Channel from '../models/Channel';
import ServerMessage from '../models/ServerMessage';
import authenticateToken from '../middleware/authMiddleware';
import mongoose from "mongoose";
import multer from 'multer';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/server_photos'); // Directory to save profile pictures
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}${file.originalname}`);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and JPG are allowed.'));
        }
    },
});


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

router.get('/public', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        // Find public servers where the user is not a member
        const publicServers = await Server.find({ public: true, members: { $ne: userId } });
        res.status(200).json(publicServers);
    } catch (error) {
        console.error('Error fetching public servers:', error);
        res.status(500).json({ message: 'Error fetching public servers' });
    }
});

// Join a Server
router.post('/join', authenticateToken, async (req, res) => {
    const { serverId } = req.body;
    const userId = req.user.userId;

    try {
        const server = await Server.findById(serverId).populate('channels');
        if (!server) {
            return res.status(404).json({ message: 'Server not found' });
        }

        if (server.members.includes(userId)) {
            return res.status(400).json({ message: 'Already a member of this server' });
        }

        server.members.push(userId);
        await server.save();

        // Return the full server details, including `_id` and channels
        const fullServer = await Server.findById(serverId).populate('channels');
        return res.status(201).json(fullServer);
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

router.post('/:serverId/channels/:channelId/message', authenticateToken, async (req, res) => {
    const { channelId } = req.params;
    const { sender, content, timestamp, profilePic } = req.body;

    try {
        console.log(`Attempting to send message to channel ID: ${channelId}`);
        console.log(`Payload received:, { sender, content, timestamp, profilePic }`);

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

router.delete('/:serverId', authenticateToken, async (req, res) => {
    const { serverId } = req.params;
    const userId = req.user.userId;

    try {
        const server = await Server.findById(serverId);
        if (!server) {
            return res.status(404).json({ message: 'Server not found' });
        }

        if (server.owner.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await Channel.deleteMany({ server: server._id });
        await Server.findByIdAndDelete(serverId);

        res.status(200).json({ message: 'Server deleted successfully' });
    } catch (error) {
        console.error('Error deleting server:', error);
        res.status(500).json({ message: 'Failed to delete server' });
    }
});

router.post('/:serverId/leave', authenticateToken, async (req, res) => {
    const { serverId } = req.params;
    const userId = req.user.userId;

    try {
        const server = await Server.findById(serverId);
        if (!server) {
            return res.status(404).json({ message: 'Server not found' });
        }

        if (server.owner.toString() === userId) {
            return res.status(400).json({
                message: 'Owner cannot leave the server. Delete it instead.',
            });
        }

        server.members = server.members.filter((memberId) => memberId.toString() !== userId);
        await server.save();

        res.status(200).json({ message: 'Successfully left the server' });
    } catch (error) {
        console.error('Error leaving server:', error);
        res.status(500).json({ message: 'Failed to leave server' });
    }
});

router.put('/:serverId', authenticateToken, upload.single('photo'), async (req, res) => {
    const { serverId } = req.params;
    const { name, channels }: { name: string; channels: { _id?: string; name: string }[] } = req.body;

    try {
        const server = await Server.findById(serverId);
        if (!server) {
            return res.status(404).json({ message: 'Server not found' });
        }

        // Ensure only the server owner can update the server
        if (server.owner.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Update server name
        if (name) server.name = name;

        // Update server photo if a new file is uploaded
        if (req.file) {
            server.photo = `/uploads/server_photos/${req.file.filename}`;
        }

        // Process channels logic if needed
        // ...

        await server.save();

        res.status(200).json({
            message: 'Server updated successfully.',
            server,
        });
    } catch (error) {
        console.error('Error updating server:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:serverId', authenticateToken, async (req, res) => {
    const { serverId } = req.params;

    try {
        // Validate serverId as a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(serverId)) {
            return res.status(400).json({ message: 'Invalid server ID' });
        }

        // Find the server by ID and populate its channels
        const server = await Server.findById(serverId).populate('channels');
        if (!server) {
            return res.status(404).json({ message: 'Server not found' });
        }

        // Return the server details
        res.status(200).json(server);
    } catch (error) {
        console.error('Error fetching server:', error);
        res.status(500).json({ message: 'Error fetching server' });
    }
});

router.post(
    '/:serverId/upload-photo',
    authenticateToken,
    upload.single('photo'),
    async (req, res) => {
        const { serverId } = req.params;

        try {
            const server = await Server.findById(serverId);

            if (!server) {
                return res.status(404).json({ message: 'Server not found' });
            }

            // Ensure only the server owner can upload a photo
            if (server.owner.toString() !== req.user.userId) {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            // Update the server's photo field
            server.photo = `/uploads/server_photos/${req.file.filename}`;
            await server.save();

            res.status(200).json({
                message: 'Server photo uploaded successfully.',
                photo: server.photo,
            });
        } catch (error) {
            console.error('Error uploading server photo:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

router.get('/recent-server', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        // Fetch the most recent message timestamp for each server the user is a member of
        const servers = await Server.find({ members: userId });
        if (servers.length === 0) {
            return res.status(404).json({ message: 'No servers found for this user.' });
        }

        const serverIds = servers.map(server => server._id);
        const recentMessages = await ServerMessage.find({
            channel: { $in: serverIds }
        }).sort({ timestamp: -1 }).limit(1).populate('channel');

        if (recentMessages.length === 0) {
            return res.status(404).json({ message: 'No recent activity found.' });
        }

        const recentMessage = recentMessages[0];
        const server = await Server.findById(recentMessage.channel.server);

        if (!server) {
            return res.status(404).json({ message: 'Server not found for the recent message.' });
        }

        res.status(200).json({
            _id: server._id,
            name: server.name,
            lastActivity: recentMessage.timestamp
        });
    } catch (error) {
        console.error('Error fetching recent server activity:', error);
        res.status(500).json({ message: 'Error fetching recent server activity' });
    }
});




export default router;