import request from "supertest";
import express from "express";
import axios from "axios";
import { Readable } from "stream";
import queriesRouter from "../../routes/queries";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const app = express();
app.use(express.json());
app.use("/api/queries", queriesRouter); // Attach the router

describe("Models and Chat API", () => {
    describe("GET /models", () => {
        it("should fetch all models successfully", async () => {
            mockedAxios.get.mockResolvedValueOnce({ data: { models: ["model1", "model2"] } });

            const response = await request(app).get("/api/queries/models");

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ models: ["model1", "model2"] });
            expect(mockedAxios.get).toHaveBeenCalledWith("http://ollama:11434/v1/models");
        });

        it("should handle errors when fetching models", async () => {
            mockedAxios.get.mockRejectedValueOnce(new Error("API error"));

            const response = await request(app).get("/api/queries/models");

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: "Failed to fetch models" });
            expect(mockedAxios.get).toHaveBeenCalledWith("http://ollama:11434/v1/models");
        });
    });

    describe("POST /chat", () => {
        it("should return 400 if model or prompt is missing", async () => {
            const response = await request(app).post("/api/queries/chat").send({});

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: "Model and prompt are required." });
        });

        it("should handle streaming chat responses successfully", async () => {
            const stream = new Readable({
                read() {
                    this.push(
                        JSON.stringify({ message: { content: "Hello!" } }) + "\n" +
                        JSON.stringify({ message: { content: " How can I assist you?" } }) + "\n"
                    );
                    this.push(null); // End of stream
                },
            });

            mockedAxios.post.mockResolvedValueOnce({ data: stream });

            const response = await request(app)
                .post("/api/queries/chat")
                .send({ model: "test-model", prompt: "What is your purpose?" });

            expect(response.status).toBe(200);
            expect(response.text).toBe("Hello! How can I assist you?");
            expect(mockedAxios.post).toHaveBeenCalledWith(
                "http://ollama:11434/api/chat",
                {
                    model: "test-model",
                    messages: [
                        {
                            role: "user",
                            content: "Respond as a helpful chat bot on a social networking website. Your answer should be short. One or two sentences max. (40 words max)What is your purpose?",
                        },
                    ],
                },
                { responseType: "stream" }
            );
        });

        it("should handle errors during chat", async () => {
            mockedAxios.post.mockRejectedValueOnce(new Error("Chat API error"));

            const response = await request(app)
                .post("/api/queries/chat")
                .send({ model: "test-model", prompt: "What is your purpose?" });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: "Chat request failed" });
        });
    });
});