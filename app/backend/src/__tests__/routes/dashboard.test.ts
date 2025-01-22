import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { app } from '../../app'; // Import your Express app
import Message from '../../models/Message';
import ServerMessage from '../../models/ServerMessage';
import Server from '../../models/Server';
import Location from '../../models/Location';
import Channel from '../../models/Channel';

let mongoServer: MongoMemoryServer;
let senderId: mongoose.Types.ObjectId;
let recipientId: mongoose.Types.ObjectId;

jest.mock('../../middleware/authMiddleware', () => {
    return jest.fn((req, res, next) => {
        req.user = { userId: recipientId.toString() };
        next();
    });
});

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { dbName: 'test' });

    senderId = new mongoose.Types.ObjectId();
    recipientId = new mongoose.Types.ObjectId();
});


afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

describe('GET /info', () => {
    beforeEach(async () => {
        // Clear collections before each test
        await Message.deleteMany({});
        await ServerMessage.deleteMany({});
        await Server.deleteMany({});
        await Location.deleteMany({});
    });

    it('should fetch dashboard data successfully', async () => {
        // Insert sample data
        await Message.create([
            { content: 'Hello!', recipient: recipientId, sender: senderId, timestamp: new Date() },
            { content: 'Hi!', recipient: recipientId, sender: senderId, timestamp: new Date() },
        ]);
        const ownerId = new mongoose.Types.ObjectId();

        const server = await Server.create({
            name: 'Test Server',
            owner: ownerId, // Ensure this is a valid ObjectId
            members: [ownerId], // Optionally add the owner as a member
            public: true,
        });
        const channel = await Channel.create({ server: server._id, name: 'General' });
        await ServerMessage.create({
            sender: senderId,
            content: 'Server Message',
            channel: channel._id,
            timestamp: new Date(),
        });

        const serverMessage = await ServerMessage.create({
            sender: senderId,
            content: 'Server Message',
            channel,
            timestamp: new Date(),
        });
        await Location.create([
            {
                name: 'Location 1',
                description: 'A beautiful place',
                lat: 45.0,
                lng: -73.0,
                rating: 5,
                owner: senderId,
                reviews: [{ rating: 5, text: 'Amazing!' }],
            },
            {
                name: 'Location 2',
                description: 'Another beautiful place',
                lat: 46.0,
                lng: -74.0,
                rating: 4.5,
                owner: recipientId,
                reviews: [{ rating: 4, text: 'Great!' }],
            },
        ]);


        const response = await request(app).get('/api/dashboard/info');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('recentMessages');
        expect(response.body).toHaveProperty('mostActiveServer');
        expect(response.body).toHaveProperty('topLocations');
    });

    it('should handle empty database gracefully', async () => {
        const response = await request(app).get('/api/dashboard/info');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            recentMessages: [],
            mostActiveServer: null,
            topLocations: [],
        });
    });

    it('should handle errors gracefully', async () => {
        jest.spyOn(Message, 'find').mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        const response = await request(app).get('/api/dashboard/info');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('message', 'Error fetching dashboard data.');
    });
});
