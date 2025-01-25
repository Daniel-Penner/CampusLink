import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { app } from '../../app';
import User from "../../models/User";
import bcrypt from "bcryptjs"; // Import the app, not the server
import { sendEmail } from '../../utils/SendEmails';

jest.mock('../../utils/SendEmails', () => ({
    sendEmail: jest.fn(),
}));


let mongoServer: MongoMemoryServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { dbName: 'test' });

    // Seed the database with a user for login tests
    const hashedPassword = await bcrypt.hash('password123', 10);
    await User.create({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'janedoe@example.com',
        password: hashedPassword,
        verified: true,
        friendCode: 'FRIENDCODE123',
    });
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

describe('POST /register', () => {
    it('should return a validation error if required fields are missing', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({});

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Validation error');
        expect(response.body.errors).toEqual({
            firstName: 'First name is required',
            lastName: 'Last name is required',
            email: 'Email is required',
            password: 'Password is required',
        });
    });
    it('should return a validation error if some fields are missing', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                firstName: 'John',
                email: 'johndoe@example.com',
                password: 'password123',
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Validation error');
        expect(response.body.errors).toEqual({
            lastName: 'Last name is required',
        });
    });
    it('failed registration with 400 error for existing email', async () => {
        await request(app).post('/api/auth/register').send({
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'janedoe@example.com',
            password: 'password123',
            verified: false,
        });
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'janedoe@example.com',
                password: 'password123',
                verified: false,
            });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'User already exists');
    });
    it('should register a new user successfully', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                email: 'johndoe@example.com',
                password: 'password123',
                verified: false,
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'User registered successfully');
        expect(response.body.user).toMatchObject({
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoe@example.com',
        });
    });
});

describe('POST /login', () => {
    it('should return correct error for nonexistent user', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'fakeuser@example.com',
                password: 'password123',
            });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'This account does not exist');
    });

    it('should return correct error for incorrect password', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'janedoe@example.com',
                password: 'password124',
            });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'This password is incorrect');
    });

    it('should return an error if the account is not verified', async () => {
        await User.create({
            firstName: 'Unverified',
            lastName: 'User',
            email: 'unverified@example.com',
            password: await bcrypt.hash('password123', 10),
            verified: false,
            friendCode: 'FRIENDCODE124',
        });

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'unverified@example.com',
                password: 'password123',
            });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'This account is not yet verified');
    });

    it('should login successfully', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'janedoe@example.com',
                password: 'password123',
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'login successful');
        expect(response.body).toHaveProperty('token');
        expect(response.body.user).toMatchObject({
            firstName: 'Jane',
            lastName: 'Doe',
            friendCode: 'FRIENDCODE123',
        });
    });
});

    describe('POST /forgot-password', () => {

        it('should return an error if email is missing', async () => {
            const response = await request(app).post('/api/auth/forgot-password').send({});

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'User with this email does not exist');
        });

        it('should return an error if the user does not exist', async () => {
            const response = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'nonexistent@example.com' });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty(
                'message',
                'User with this email does not exist'
            );
        });

        it('should generate a reset token and send an email if user exists', async () => {
            const response = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'janedoe@example.com' });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty(
                'message',
                'Password reset email sent successfully'
            );

            const user = await User.findOne({ email: 'janedoe@example.com' });
            expect(user).toHaveProperty('resetPasswordToken');
            expect(user?.resetPasswordToken).toBeDefined();
            expect(user?.resetPasswordExpires).toBeDefined();

            expect(sendEmail).toHaveBeenCalledWith(
                'janedoe@example.com',
                'Password Reset Request',
                expect.any(String),
                expect.any(String)
            );
        });
    });

    describe('POST /reset-password/:token', () => {
        it('should return an error if the token is invalid or expired', async () => {
            const response = await request(app)
                .post('/api/auth/reset-password/invalidtoken')
                .send({ password: 'newpassword123' });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Invalid or expired token');
        });

        it('should reset the password successfully if the token is valid', async () => {
            const user = await User.create({
                firstName: 'Reset',
                lastName: 'TokenUser',
                email: 'resettoken@example.com',
                password: await bcrypt.hash('oldpassword123', 10),
                verified: true,
                friendCode: 'RESETCODE123',
                resetPasswordToken: 'validtoken123',
                resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour from now
            });

            const response = await request(app)
                .post('/api/auth/reset-password/validtoken123')
                .send({ password: 'newpassword123' });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Password successfully reset');

            const updatedUser = await User.findOne({ email: 'resettoken@example.com' });
            expect(updatedUser).toBeTruthy();
            const isMatch = await bcrypt.compare('newpassword123', updatedUser?.password || '');
            expect(isMatch).toBe(true);
            expect(updatedUser?.resetPasswordToken).toBeUndefined();
            expect(updatedUser?.resetPasswordExpires).toBeUndefined();
        });
    });

    describe('POST /resend-verification', () => {
        it('should return an error if the email is not provided', async () => {
            const response = await request(app).post('/api/auth/resend-verification').send({});

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'User not found');
        });

        it('should return an error if the user is already verified', async () => {
            const user = await User.create({
                firstName: 'Verified',
                lastName: 'User',
                email: 'verified@example.com',
                password: await bcrypt.hash('password123', 10),
                verified: true,
                friendCode: 'VERIFIEDCODE123',
            });

            const response = await request(app)
                .post('/api/auth/resend-verification')
                .send({ email: 'verified@example.com' });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'This account is already verified');
        });

        it('should resend a verification email if the user is not verified', async () => {
            const user = await User.create({
                firstName: 'Unverified',
                lastName: 'User',
                email: 'unverifiedemail@example.com',
                password: await bcrypt.hash('password123', 10),
                verified: false,
                friendCode: 'UNVERIFIEDCODE123',
            });

            const response = await request(app)
                .post('/api/auth/resend-verification')
                .send({ email: 'unverified@example.com' });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Verification email sent successfully');

            const updatedUser = await User.findOne({ email: 'unverified@example.com' });
            expect(updatedUser).toHaveProperty('verificationToken');
            expect(updatedUser?.verificationToken).toBeDefined();
            expect(updatedUser?.verificationExpires).toBeDefined();
        });
    });

    describe('GET /verify-email/:token', () => {
        it('should return an error if the token is invalid or expired', async () => {
            const response = await request(app).get('/api/auth/verify-email/invalidtoken');

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Invalid or expired token');
        });

        it('should verify the user successfully if the token is valid', async () => {
            const user = await User.create({
                firstName: 'Verify',
                lastName: 'User',
                email: 'verifyuser@example.com',
                password: await bcrypt.hash('password123', 10),
                verified: false,
                friendCode: 'VERIFYCODE123',
                verificationToken: 'validtoken456',
                verificationExpires: new Date(Date.now() + 3600000), // 1 hour from now
            });

            const response = await request(app).get('/api/auth/verify-email/validtoken456');

            expect(response.status).toBe(302); // Redirects to login
            const updatedUser = await User.findOne({ email: 'verifyuser@example.com' });
            expect(updatedUser).toBeTruthy();
            expect(updatedUser?.verified).toBe(true);
            expect(updatedUser?.verificationToken).toBeUndefined();
            expect(updatedUser?.verificationExpires).toBeUndefined();
        });
    });