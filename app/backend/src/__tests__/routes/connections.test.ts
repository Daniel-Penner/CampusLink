import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { app } from '../../app';
import User from '../../models/User';
import Connection from '../../models/Connection';
import bcrypt from 'bcryptjs';

let mongoServer: MongoMemoryServer;
let senderId: mongoose.Types.ObjectId;
let recipientId: mongoose.Types.ObjectId;

jest.mock('../../middleware/authMiddleware', () => {
    return jest.fn((req, res, next) => {
        req.user = { userId: senderId.toString() };
        next();
    });
});

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { dbName: 'test' });

    const hashedPassword = await bcrypt.hash('password123', 10);

    senderId = new mongoose.Types.ObjectId();
    recipientId = new mongoose.Types.ObjectId();

    // Create sender and recipient users
    await User.create({
        _id: senderId,
        firstName: 'Sender',
        lastName: 'User',
        email: 'sender@example.com',
        password: hashedPassword,
        verified: true,
        friendCode: 'FRIENDCODE123',
    });

    await User.create({
        _id: recipientId,
        firstName: 'Recipient',
        lastName: 'User',
        email: 'recipient@example.com',
        password: hashedPassword,
        verified: true,
        friendCode: 'FRIENDCODE456',
    });
});

beforeEach(async () => {
    await Connection.deleteMany({}); // Ensure no connections exist
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

describe('POST /add', () => {
    it('should return an error if the recipient does not exist', async () => {
        const response = await request(app)
            .post('/api/connections/add')
            .send({friendCode: 'INVALIDCODE'});

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message', 'User with this friend code not found');
    });

    it('should return an error if a request already exists', async () => {
        await Connection.create({
            sender: senderId,
            recipient: recipientId,
            accepted: false,
        });

        const response = await request(app)
            .post('/api/connections/add')
            .send({friendCode: 'FRIENDCODE456'});

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Connection already exists or a request has already been sent');
    });

    it('should send a friend request successfully', async () => {
        await Connection.remove({
            sender: senderId,
            recipient: recipientId,
        })
        const response = await request(app)
            .post('/api/connections/add')
            .send({friendCode: 'FRIENDCODE456'});

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'Friend request sent successfully');

        const connection = await Connection.findOne({
            sender: senderId,
            recipient: recipientId,
        });
        expect(connection).toBeTruthy();
        expect(connection!.accepted).toBe(false);
    });
});

    describe('POST /delete', () => {
        it('should return an error if the connection does not exist', async () => {
            const response = await request(app)
                .post('/api/connections/delete')
                .send({ user2Id: recipientId.toString() });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Connection does not exist');
        });

        it('should delete an existing connection', async () => {
            const connection = await Connection.create({
                sender: senderId,
                recipient: recipientId,
                accepted: true,
            });

            const response = await request(app)
                .post('/api/connections/delete')
                .send({ user2Id: recipientId.toString() });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('message', 'Connection Deleted successfully');

            const deletedConnection = await Connection.findById(connection._id);
            expect(deletedConnection).toBeNull();
        });
    });

    describe('POST /accept', () => {
        it('should return an error if the connection does not exist', async () => {
            const response = await request(app)
                .post('/api/connections/accept')
                .send({ user2Id: recipientId.toString() });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Connection does not exist');
        });

        it('should accept a friend request successfully', async () => {
            const connection = await Connection.create({
                sender: recipientId,
                recipient: senderId,
                accepted: false,
            });

            const response = await request(app)
                .post('/api/connections/accept')
                .send({ user2Id: recipientId.toString() });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('message', 'Friend request accepted successfully!');

            const updatedConnection = await Connection.findById(connection._id);
            expect(updatedConnection!.accepted).toBe(true);
        });
    });

describe('Connections Routes - GET', () => {
    beforeEach(async () => {
        // Clear connections before each test
        await Connection.deleteMany({});
    });
    describe('GET /friends', () => {
    it('should return a list of accepted friends', async () => {
        // Create an accepted connection
        await Connection.create({
            sender: senderId,
            recipient: recipientId,
            accepted: true,
        });

        const response = await request(app).get('/api/connections/friends');

        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toMatchObject({
            sender: {
                firstName: 'Sender',
                lastName: 'User',
                email: 'sender@example.com',
                friendCode: 'FRIENDCODE123',
            },
            recipient: {
                firstName: 'Recipient',
                lastName: 'User',
                email: 'recipient@example.com',
                friendCode: 'FRIENDCODE456',
            },
        });
    });

    it('should return an empty list if there are no accepted friends', async () => {
        const response = await request(app).get('/api/connections/friends');

        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body).toHaveLength(0);
    });
    });

    describe('GET /sent-pending', () => {
        it('should return a list of pending sent friend requests', async () => {
            // Create a pending connection
            await Connection.create({
                sender: senderId,
                recipient: recipientId,
                accepted: false,
            });

            const response = await request(app).get('/api/connections/sent-pending');

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].recipient).toMatchObject({
                firstName: 'Recipient',
                lastName: 'User',
                email: 'recipient@example.com',
                friendCode: 'FRIENDCODE456',
            });
        });

        it('should return an empty list if there are no pending sent friend requests', async () => {
            const response = await request(app).get('/api/connections/sent-pending');

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body).toHaveLength(0);
        });
    });

    describe('GET /received-pending', () => {
        it('should return a list of pending received friend requests', async () => {
            // Create a pending connection
            await Connection.create({
                sender: recipientId,
                recipient: senderId,
                accepted: false,
            });

            const response = await request(app).get('/api/connections/received-pending');

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].sender).toMatchObject({
                firstName: 'Recipient',
                lastName: 'User',
                email: 'recipient@example.com',
                friendCode: 'FRIENDCODE456',
            });
        });

        it('should return an empty list if there are no pending received friend requests', async () => {
            const response = await request(app).get('/api/connections/received-pending');

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body).toHaveLength(0);
        });
    });
});

