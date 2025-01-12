import { Router, Request, Response } from "express";
import axios from "axios";

const router = Router();

// Fetch all available models
router.get("/models", async (req: Request, res: Response) => {
    try {
        const response = await axios.get("http://ollama:11434/v1/models");
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching models:", error);
        res.status(500).json({ error: "Failed to fetch models" });
    }
});

// Chat endpoint
router.post("/chat", async (req: Request, res: Response) => {
    const { model, prompt } = req.body;

    if (!model || !prompt) {
        return res.status(400).json({ error: "Model and prompt are required." });
    }

    try {
        const chatResponse = await axios.post("http://ollama:11434/api/chat", {
            model,
            messages: [{ role: "user", content: prompt }],
        }, { responseType: "stream" }); // Use streaming response

        res.setHeader("Content-Type", "text/plain");

        let accumulatedResponse = "";

        chatResponse.data.on("data", (chunk: Buffer) => {
            try {
                const lines = chunk.toString().split("\n").filter((line) => line.trim() !== "");

                for (const line of lines) {
                    const parsed = JSON.parse(line);
                    if (parsed.message?.content) {
                        accumulatedResponse += parsed.message.content;
                        res.write(parsed.message.content); // Stream content to the client
                    }
                }
            } catch (error) {
                console.error("Error parsing chat response chunk:", error);
            }
        });

        chatResponse.data.on("end", () => {
            res.end(); // Signal the end of the stream
        });

    } catch (error) {
        console.error("Error during chat:", error);
        res.status(500).json({ error: "Chat request failed" });
    }
});

export default router;
