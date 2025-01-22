import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import express from "express";
import serverRoutes from "../../routes/servers";
import Server from "../../models/Server";
import Channel from "../../models/Channel";
import fs from "fs";
import path from "path";
import { app } from '../../app'; // Import your Express app

let mongoServer: MongoMemoryServer;
let userId: mongoose.Types.ObjectId;

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

    app.use(express.json());
    app.use("/api/servers", serverRoutes);

    userId = new mongoose.Types.ObjectId();
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

describe("Server Routes API", () => {
    beforeEach(async () => {
        await Server.deleteMany({});
        await Channel.deleteMany({});
    });

    describe("POST /api/servers/create", () => {
        it("should create a new server with channels", async () => {
            const response = await request(app)
                .post("/api/servers/create")
                .send({
                    name: "Test Server",
                    isPublic: true,
                    channels: [
                        { name: "General" },
                        { name: "Announcements" },
                    ],
                });

            expect(response.status).toBe(201);
            expect(response.body.name).toBe("Test Server");
            expect(response.body.channels.length).toBe(2);
        });

        it("should return 500 if server creation fails", async () => {
            jest.spyOn(Server.prototype, "save").mockImplementationOnce(() => {
                throw new Error("Failed to save server");
            });

            const response = await request(app)
                .post("/api/servers/create")
                .send({
                    name: "Test Server",
                    isPublic: true,
                    channels: [
                        { name: "General" },
                        { name: "Announcements" },
                    ],
                });

            expect(response.status).toBe(500);
            expect(response.body.message).toBe("Error creating server");
        });
    });

    describe("GET /api/servers", () => {
        it("should fetch all servers the user is a member of", async () => {
            await Server.create({
                name: "Test Server",
                owner: userId,
                members: [userId],
                public: true,
            });

            const response = await request(app).get("/api/servers");

            expect(response.status).toBe(200);
            expect(response.body.length).toBe(1);
        });
    });

    describe("GET /api/servers/public", () => {
        it("should fetch all public servers the user is not a member of", async () => {
            await Server.create({
                name: "Public Server",
                owner: new mongoose.Types.ObjectId(),
                public: true,
            });

            const response = await request(app).get("/api/servers/public");

            expect(response.status).toBe(200);
            expect(response.body.length).toBe(1);
        });
    });

    describe("POST /api/servers/:serverId/upload-photo", () => {
        const uploadDir = path.join(__dirname, "../uploads/server_photos");

        beforeEach(() => {
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
        });

        afterEach(() => {
            fs.rmSync(uploadDir, { recursive: true, force: true });
        });

        it("should upload a photo for a server", async () => {
            const server = await Server.create({
                name: "Photo Test Server",
                owner: userId,
                public: true,
                members: [userId],
            });

            const response = await request(app)
                .post(`/api/servers/${server._id}/upload-photo`)
                .attach("photo", Buffer.from("test photo content"), "test.jpg");

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Server photo uploaded successfully.");
            expect(response.body.photo).toContain("/uploads/server_photos");
        });

        it("should return 400 if no file is uploaded", async () => {
            const server = await Server.create({
                name: "Photo Test Server",
                owner: userId,
                public: true,
                members: [userId],
            });

            const response = await request(app).post(
                `/api/servers/${server._id}/upload-photo`
            );

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("No file uploaded");
        });
    });
});
