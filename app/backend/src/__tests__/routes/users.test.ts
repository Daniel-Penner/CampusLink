import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import express from "express";
import userRoutes from "../../routes/users";
import User from "../../models/User";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { app } from "../../app";

let mongoServer: MongoMemoryServer;
let userId: mongoose.Types.ObjectId;

app.use(express.json());
app.use("/api/users", userRoutes);

jest.mock("../../middleware/authMiddleware", () => {
    return jest.fn((req, res, next) => {
        req.user = { userId: userId.toString() };
        next();
    });
});

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { dbName: "test" });

    userId = new mongoose.Types.ObjectId();
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

describe("User Routes API", () => {
    beforeEach(async () => {
        await User.deleteMany({});
    });

    describe("GET /api/users/:userId", () => {
        it("should fetch a user by ID", async () => {
            const user = await User.create({
                _id: userId,
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                password: "password123",
                friendCode: '123456',
            });

            const response = await request(app).get(`/api/users/${userId}`);

            expect(response.status).toBe(200);
            expect(response.body.firstName).toBe(user.firstName);
        });

        it("should return 404 if user is not found", async () => {
            const response = await request(app).get(
                `/api/users/${new mongoose.Types.ObjectId()}`
            );
            expect(response.status).toBe(404);
            expect(response.body.message).toBe("User not found");
        });
    });

    describe("PUT /api/users/:userId", () => {
        it("should update user profile", async () => {
            const hashedPassword = await bcrypt.hash("password123", 10);
            const user = await User.create({
                _id: userId,
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                password: hashedPassword,
                friendCode: '123456',
            });

            const response = await request(app)
                .put(`/api/users/${userId}`)
                .send({
                    firstName: "Updated",
                    currentPassword: "password123",
                    newPassword: "newPassword123",
                });

            expect(response.status).toBe(200);
            expect(response.body.user.firstName).toBe("Updated");
        });

        it("should return 400 for incorrect current password", async () => {
            const hashedPassword = await bcrypt.hash("password123", 10);
            const user = await User.create({
                _id: userId,
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                password: hashedPassword,
                friendCode: '123456',
            });

            const response = await request(app)
                .put(`/api/users/${userId}`)
                .send({
                    firstName: "Updated",
                    currentPassword: "wrongPassword",
                    newPassword: "newPassword123",
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Current password is incorrect");
        });
    });

    describe("GET /api/users/verify-email-change/:token", () => {
        it("should verify email change", async () => {
            const hashedPassword = await bcrypt.hash("password123", 10);
            const token = "testToken";
            const user = await User.create({
                _id: userId,
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                emailChangeToken: token,
                emailChangeExpires: new Date(Date.now() + 3600000),
                password: hashedPassword,
                newEmail: "new.email@example.com",
                friendCode: '123456',
            });

            const response = await request(app).get(
                `/api/users/verify-email-change/${token}`
            );

            expect(response.status).toBe(200);
            expect(response.body.message).toBe(
                "Email updated and verified successfully."
            );
        });

        it("should return 400 for invalid or expired token", async () => {
            const response = await request(app).get(
                `/api/users/verify-email-change/invalidToken`
            );

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Invalid or expired token");
        });
    });

    describe("POST /api/users/:userId/upload-profile-picture", () => {
        const uploadDir = path.join(__dirname, "../uploads/profile_pictures");

        beforeEach(() => {
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
        });

        afterEach(() => {
            fs.rmSync(uploadDir, { recursive: true, force: true });
        });

        it("should upload a profile picture", async () => {
            const hashedPassword = await bcrypt.hash("password123", 10);
            const user = await User.create({
                _id: userId,
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                password: hashedPassword,
                friendCode: '123456',
            });

            const response = await request(app)
                .post(`/api/users/${userId}/upload-profile-picture`)
                .attach("profilePicture", Buffer.from("test content"), "test.jpg");

            expect(response.status).toBe(200);
            expect(response.body.message).toBe(
                "Profile picture uploaded successfully."
            );
            expect(response.body.profilePicture).toContain("/uploads/profile_pictures");
        });

        it("should return 400 if no file is uploaded", async () => {
            const hashedPassword = await bcrypt.hash("password123", 10);
            const user = await User.create({
                _id: userId,
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                password: hashedPassword,
                friendCode: '123456',
            });

            const response = await request(app).post(
                `/api/users/${userId}/upload-profile-picture`
            );

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("No file uploaded");
        });
    });
});
