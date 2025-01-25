import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { app } from '../../app'; // Import your Express app
import Location from '../../models/Location';
import path from "path";
import * as fs from "node:fs";

let mongoServer: MongoMemoryServer;
let userId: mongoose.Types.ObjectId;

jest.mock('../../middleware/authMiddleware', () => {
    return jest.fn((req, res, next) => {
        req.user = { userId: userId.toString() };
        next();
    });
});

beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { dbName: 'test' });

    userId = new mongoose.Types.ObjectId();
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

describe('Locations API', () => {
    beforeEach(async () => {
        await Location.deleteMany({});
    });

    describe('POST /api/locations/create', () => {
        it('should create a new location', async () => {
            const response = await request(app)
                .post('/api/locations/create')
                .send({
                    name: 'Test Location',
                    description: 'A beautiful test location',
                    lat: 10,
                    lng: -10,
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('_id');
            expect(response.body.name).toBe('Test Location');
        });

        it('should return a validation error for missing fields', async () => {
            const response = await request(app)
                .post('/api/locations/create')
                .send({name: 'Test Location'});

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message', 'Error creating location');
        });
    });

    describe('GET /api/locations', () => {
        it('should fetch all locations', async () => {
            // Seed test data
            await Location.create([
                { name: 'Location 1', description: 'Test 1', lat: 10, lng: -10, owner: userId },
                { name: 'Location 2', description: 'Test 2', lat: 46.0, lng: -74.0, owner: userId },
            ]);

            const response = await request(app).get('/api/locations');

            expect(response.status).toBe(200);
            expect(response.body.length).toBe(2);
        });
        it('should fetch no locations', async () => {

            const response = await request(app).get('/api/locations');

            expect(response.status).toBe(200);
            expect(response.body.length).toBe(0);
        });
    });

    describe('POST /api/locations/:locationId/review', () => {
        it('should add a review to a location', async () => {
            const location = await Location.create({
                name: 'Location 1',
                description: 'Test 1',
                lat: 10,
                lng: -10,
                owner: userId,
            });

            const response = await request(app)
                .post(`/api/locations/${location._id}/review`)
                .send({ rating: 5, text: 'Great location!' });

            expect(response.status).toBe(201);
            expect(response.body.reviews.length).toBe(1);
            expect(response.body.rating).toBe(5);
        });
        it('should be unable to find location', async () => {
            const location = await Location.create({
                name: 'Location 1',
                description: 'Test 1',
                lat: 10,
                lng: -10,
                owner: userId,
            });

            await Location.deleteMany({where: {locationId: location._id}});

            const response = await request(app)
                .post(`/api/locations/${location._id}/review`)
                .send({ rating: 5, text: 'Great location!' });

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Location not found');
        });
    });

    describe('GET /api/locations/:locationId', () => {
        it('should fetch a specific location', async () => {
            const location = await Location.create({
                name: 'Location 1',
                description: 'Test 1',
                lat: 10,
                lng: -10,
                owner: userId,
            });

            const response = await request(app)
                .get(`/api/locations/${location._id}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('_id', location._id.toString());
        });

        it('should return 404 if location not found', async () => {
            const response = await request(app)
                .get(`/api/locations/${new mongoose.Types.ObjectId()}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Location not found');
        });
    });

    describe('GET /api/locations/:locationId/reviews', () => {
        it('should find a review', async () => {
            const location = await Location.create({
                name: 'Test Location',
                description: 'A location for testing',
                lat: 10,
                lng: -10,
                owner: userId,
                reviews: [
                    { rating: 5, text: 'Amazing place!' },
                    { rating: 4, text: 'Pretty good!' },
                ],
            });

            const response = await request(app).get(`/api/locations/${location._id}/reviews`);

            expect(response.status).toBe(200);
            expect(response.body.length).toBe(2);
        });
        it('should find no reviews', async () => {
            const location = await Location.create({
                name: 'Location 1',
                description: 'Test 1',
                lat: 10,
                lng: -10,
                owner: userId,
            });

            const response = await request(app).get(`/api/locations/${location._id}/reviews`);

            expect(response.status).toBe(200);
            expect(response.body.length).toBe(0);
        });
    });

    describe('PUT /api/locations/:locationId', () => {
        it('should update a location', async () => {
            const location = await Location.create({
                name: 'Location 1',
                description: 'Test 1',
                lat: 10,
                lng: -10,
                owner: userId,
            });

            const response = await request(app)
                .put(`/api/locations/${location._id}`)
                .send({ name: 'Updated Location' });

            expect(response.status).toBe(200);
            expect(response.body.name).toBe('Updated Location');
        });

        it('should return 403 if user is not the owner', async () => {
            const location = await Location.create({
                name: 'Location 1',
                description: 'Test 1',
                lat: 10,
                lng: -10,
                owner: new mongoose.Types.ObjectId(), // Different owner
            });

            const response = await request(app)
                .put(`/api/locations/${location._id}`)
                .send({ name: 'Updated Location' });

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('message', 'Unauthorized');
        });
    });

    describe('DELETE /api/locations/:locationId', () => {
        it('should delete a location', async () => {
            const location = await Location.create({
                name: 'Location 1',
                description: 'Test 1',
                lat: 10,
                lng: -10,
                owner: userId,
            });

            const response = await request(app).delete(`/api/locations/${location._id}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Location deleted successfully');
        });

        it('should return 403 if user is not the owner', async () => {
            const location = await Location.create({
                name: 'Location 1',
                description: 'Test 1',
                lat: 10,
                lng: -10,
                owner: new mongoose.Types.ObjectId(), // Different owner
            });

            const response = await request(app).delete(`/api/locations/${location._id}`);

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('message', 'Unauthorized to delete this location');
        });
    });

    describe('POST /api/locations/:locationId/upload-image', () => {
        it('should upload an image successfully', async () => {
            const location = await Location.create({
                name: 'Location 1',
                description: 'Test 1',
                lat: 10,
                lng: -10,
                owner: userId,
            });
            const filePath = path.join(__dirname, '../test-files/test-image.jpg');
            fs.writeFileSync(filePath, 'Test Image Content');

            const response = await request(app)
                .post(`/api/locations/${location._id}/upload-image`)
                .attach('image', filePath);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Image uploaded successfully');
            expect(response.body.image).toContain('/uploads/location_images/');

            // Cleanup
            fs.unlinkSync(filePath);
        });
        it('should return 400 if no file is uploaded', async () => {
            const location = await Location.create({
                name: 'Location 1',
                description: 'Test 1',
                lat: 10,
                lng: -10,
                owner: userId,
            });

            const response = await request(app)
                .post(`/api/locations/${location._id}/upload-image`);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'No file uploaded');
        });

        it('should return an error for invalid location', async () => {
            const location = await Location.create({
                name: 'Location 1',
                description: 'Test 1',
                lat: 10,
                lng: -10,
                owner: userId,
            });

            await Location.deleteMany({name: 'Location 1'});

            const response = await request(app)
                .post(`/api/locations/${location._id}/upload-image`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Location not found');
        });
    });


});