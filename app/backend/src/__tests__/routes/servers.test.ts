import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import express from "express";
import serverRoutes from "../../routes/servers";
import Server from "../../models/Server";
import Channel from "../../models/Channel";
import ServerMessage from "../../models/ServerMessage";
import fs from "fs";
import path from "path";
import { app } from "../../app";
import user from "../../models/User";

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
        await ServerMessage.deleteMany({});
    });

    describe("POST /api/servers/create", () => {
        it("should create a new server with channels", async () => {
            const response = await request(app)
                .post("/api/servers/create")
                .send({
                    name: "Test Server",
                    isPublic: true,
                    channels: [{ name: "General" }, { name: "Announcements" }],
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
                    channels: [{ name: "General" }, { name: "Announcements" }],
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

    describe("POST /api/servers/join", () => {
        it("should join a server", async () => {
            const server = await Server.create({
                name: "Joinable Server",
                owner: new mongoose.Types.ObjectId(),
                public: true,
                members: [],
            });

            const response = await request(app)
                .post("/api/servers/join")
                .send({ serverId: server._id });

            expect(response.status).toBe(201);
            expect(response.body.members.length).toBe(1);
        });

        it("should return 404 if server is not found", async () => {
            const response = await request(app)
                .post("/api/servers/join")
                .send({ serverId: new mongoose.Types.ObjectId() });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Server not found");
        });
    });

    describe("DELETE /api/servers/:serverId", () => {
        it("should delete a server if the user is the owner", async () => {
            const server = await Server.create({
                name: "Deletable Server",
                owner: userId,
                public: true,
                members: [userId],
            });

            const response = await request(app).delete(`/api/servers/${server._id}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Server deleted successfully");
        });

        it("should return 403 if the user is not the owner", async () => {
            const server = await Server.create({
                name: "Not Owned Server",
                owner: new mongoose.Types.ObjectId(),
                public: true,
                members: [userId],
            });

            const response = await request(app).delete(`/api/servers/${server._id}`);

            expect(response.status).toBe(403);
            expect(response.body.message).toBe("Unauthorized");
        });
    });

    describe("GET /api/servers/:serverId/channels", () => {
        it("should fetch channels for a server", async () => {
            const server = await Server.create({
                name: "Channel Fetch Server",
                owner: userId,
                public: true,
                members: [userId],
            });

            const channel = await Channel.create({
                name: "General",
                server: server._id,
            });

            server.channels.push(channel._id);
            await server.save();

            const response = await request(app).get(
                `/api/servers/${server._id}/channels`
            );

            expect(response.status).toBe(200);
            expect(response.body.length).toBe(1);
            expect(response.body[0].name).toBe("General");
        });

        it("should return 404 if server is not found", async () => {
            const response = await request(app).get(
                `/api/servers/${new mongoose.Types.ObjectId()}/channels`
            );

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Server not found");
        });
    });
    describe("PUT /api/servers/:serverId", () => {
        it("should update the server's name and photo", async () => {
            const server = await Server.create({
                name: "Old Server Name",
                owner: userId,
                public: true,
                members: [userId],
            });

            const response = await request(app)
                .put(`/api/servers/${server._id}`)
                .set('Content-Type', 'multipart/form-data')
                .field('name', 'Updated Server Name')
                .attach('photo', Buffer.from('test photo content'), 'test.jpg');

            console.log(response.body); // Debugging response

            expect(response.status).toBe(200);
            expect(response.body.updatedServer.name).toBe('Updated Server Name'); // Fixed assertion
            expect(response.body.updatedServer.photo).toContain('/uploads/server_photos'); // Fixed assertion
        });



        it("should return 403 if user is not the owner", async () => {
            const server = await Server.create({
                name: "Server",
                owner: new mongoose.Types.ObjectId(),
                public: true,
                members: [userId],
            });

            const response = await request(app)
                .put(`/api/servers/${server._id}`)
                .field("name", "Updated Server Name");

            expect(response.status).toBe(403);
            expect(response.body.message).toBe("Unauthorized");
        });

        it("should return 404 if server does not exist", async () => {
            const response = await request(app)
                .put(`/api/servers/${new mongoose.Types.ObjectId()}`)
                .field("name", "Updated Server Name");

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Server not found");
        });
    });

    describe("POST /api/servers/:serverId/leave", () => {
        it("should allow a user to leave a server", async () => {
            const server = await Server.create({
                name: "Leaveable Server",
                owner: new mongoose.Types.ObjectId(),
                public: true,
                members: [userId],
            });

            const response = await request(app).post(`/api/servers/${server._id}/leave`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Successfully left the server");
        });

        it("should return 400 if the user is the server owner", async () => {
            const server = await Server.create({
                name: "Owner Server",
                owner: userId,
                public: true,
                members: [userId],
            });

            const response = await request(app).post(`/api/servers/${server._id}/leave`);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe(
                "Owner cannot leave the server. Delete it instead."
            );
        });

        it("should return 404 if server is not found", async () => {
            const response = await request(app).post(
                `/api/servers/${new mongoose.Types.ObjectId()}/leave`
            );

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Server not found");
        });
    });

    describe("GET /api/servers/:serverId", () => {
        it("should fetch a single server by ID", async () => {
            const server = await Server.create({
                name: "Single Server",
                owner: userId,
                public: true,
                members: [userId],
            });

            const response = await request(app).get(`/api/servers/${server._id}`);

            expect(response.status).toBe(200);
            expect(response.body.name).toBe("Single Server");
        });

        it("should return 404 if server is not found", async () => {
            const response = await request(app).get(
                `/api/servers/${new mongoose.Types.ObjectId()}`
            );

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Server not found");
        });

        it("should return 400 for invalid server ID", async () => {
            const response = await request(app).get(`/api/servers/invalid-id`);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Invalid server ID");
        });
    });

    describe("GET /api/servers/:serverId/channels/:channelId/messages", () => {
        it("should fetch messages from a specific channel", async () => {
            const server = await Server.create({
                name: "Message Server",
                owner: userId,
                public: true,
                members: [userId],
            });

            const channel = await Channel.create({
                name: "General",
                server: server._id,
            });

            const message = await ServerMessage.create({
                sender: userId,
                content: "Hello, world!",
                timestamp: new Date(),
                channel: channel._id,
            });

            channel.messages.push(message._id);
            await channel.save();

            const response = await request(app).get(
                `/api/servers/${server._id}/channels/${channel._id}/messages`
            );

            expect(response.status).toBe(200);
            expect(response.body.length).toBe(1);
            expect(response.body[0].content).toBe("Hello, world!");
        });

        it("should return 404 if channel is not found", async () => {
            const server = await Server.create({
                name: "Message Server",
                owner: userId,
                public: true,
                members: [userId],
            });

            const response = await request(app).get(
                `/api/servers/${server._id}/channels/${new mongoose.Types.ObjectId()}/messages`
            );

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Channel not found");
        });
    });

    describe("POST /api/servers/:serverId/channels/:channelId/message", () => {
        it("should send a message to a specific channel", async () => {
            const server = await Server.create({
                name: "Messaging Server",
                owner: userId,
                public: true,
                members: [userId],
            });

            const channel = await Channel.create({
                name: "General",
                server: server._id,
            });

            const response = await request(app)
                .post(`/api/servers/${server._id}/channels/${channel._id}/message`)
                .send({
                    sender: userId,
                    content: "Test Message",
                    timestamp: new Date().toISOString(),
                });

            expect(response.status).toBe(201);
            expect(response.body.content).toBe("Test Message");
        });

        it("should return 404 if channel is not found", async () => {
            const server = await Server.create({
                name: "Messaging Server",
                owner: userId,
                public: true,
                members: [userId],
            });

            const response = await request(app)
                .post(`/api/servers/${server._id}/channels/${new mongoose.Types.ObjectId()}/message`)
                .send({
                    sender: userId,
                    content: "Test Message",
                    timestamp: new Date().toISOString(),
                });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Channel not found");
        });
    });
});