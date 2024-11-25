import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { app } from '../../app';
import User from '../../models/User';
import Message from '../../models/Message';
import Connection from '../../models/Connection';
import bcrypt from 'bcryptjs';

let mongoServer: MongoMemoryServer;
let userId: mongoose.Types.ObjectId;
let otherUserId: mongoose.Types.ObjectId;

jest.mock('../../middleware/authMiddleware', () => {
    return jest.fn((req, res, next) => {
        req.user = { userId: userId.toString() };
        next();
    });
});

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { dbName: 'test' });

    const hashedPassword = await bcrypt.hash('password123', 10);

    userId = new mongoose.Types.ObjectId();
    otherUserId = new mongoose.Types.ObjectId();

    // Create sender and recipient users with a friendCode
    await User.create({
        _id: userId,
        firstName: 'User',
        lastName: 'One',
        email: 'userone@example.com',
        password: hashedPassword,
        verified: true,
        friendCode: 'FRIENDCODE123', // Ensure this is provided
        profilePicture: 'userone-pic.png',
    });

    await User.create({
        _id: otherUserId,
        firstName: 'User',
        lastName: 'Two',
        email: 'usertwo@example.com',
        password: hashedPassword,
        verified: true,
        friendCode: 'FRIENDCODE456', // Ensure this is provided
        profilePicture: 'usertwo-pic.png',
    });

    await Connection.create({
        sender: userId,
        recipient: otherUserId,
        accepted: true,
    });

    await Message.create([
        {
            sender: userId,
            recipient: otherUserId,
            content: 'Hello!',
            timestamp: new Date(),
        },
        {
            sender: otherUserId,
            recipient: userId,
            content: 'Hi there!',
            timestamp: new Date(),
        },
    ]);
});


afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

describe('GET /messageable-friends', () => {
    it('should return a list of messageable friends', async () => {
        const response = await request(app).get('/api/direct-messages/messageable-friends');

        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toMatchObject({
            _id: otherUserId.toString(),
            firstName: 'User',
            lastName: 'Two',
            email: 'usertwo@example.com',
            profilePicture: 'usertwo-pic.png',
        });
    });
});

describe('GET /messages/:userId/:otherUserId', () => {
    it('should return the message history between two users', async () => {
        const response = await request(app).get(
            `/api/direct-messages/messages/${userId.toString()}/${otherUserId.toString()}`
        );

        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body).toHaveLength(2);
        expect(response.body[0]).toMatchObject({
            sender: userId.toString(),
            recipient: otherUserId.toString(),
            content: 'Hello!',
        });
        expect(response.body[1]).toMatchObject({
            sender: otherUserId.toString(),
            recipient: userId.toString(),
            content: 'Hi there!',
        });
    });

    it('should return an empty array if there is no message history', async () => {
        const response = await request(app).get(
            `/api/direct-messages/messages/${userId.toString()}/${new mongoose.Types.ObjectId().toString()}`
        );
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body).toHaveLength(0);
    });
});

 describe('POST /message', () => {
     it('should send a new message successfully', async () => {
         const messageData = {
             sender: userId.toString(),
             recipient: otherUserId.toString(),
             content: 'New message!',
             timestamp: new Date(),
            };

         const response = await request(app).post('/api/direct-messages/message').send(messageData);

         expect(response.status).toBe(201);
         expect(response.body).toMatchObject({
             sender: userId.toString(),
             recipient: otherUserId.toString(),
             content: 'New message!',
         });

         const savedMessage = await Message.findOne({
             sender: userId,
             recipient: otherUserId,
             content: 'New message!',
         });
         expect(savedMessage).toBeTruthy();
     });

     it('should return an error if the message fails to save', async () => {
         const messageData = {
             sender: userId.toString(),
             recipient: otherUserId.toString(),
             // Missing content field
             timestamp: new Date(),
         };

         const response = await request(app).post('/api/direct-messages/message').send(messageData);

         expect(response.status).toBe(500);
         expect(response.body).toHaveProperty('message', 'Error saving message');
     });
 });
