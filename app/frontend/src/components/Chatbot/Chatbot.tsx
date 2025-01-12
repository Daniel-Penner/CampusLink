import React, { useState } from "react";
import styles from "./Chatbot.module.css";

const Chatbot: React.FC = () => {
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState(""); // To display the response
    const [loading, setLoading] = useState(false);

    const handleQuery = async () => {
        if (!query.trim()) return;

        setLoading(true);
        setResponse("");

        try {
            const res = await fetch("/api/queries/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "llama3.1:latest",
                    prompt: query,
                }),
            });

            if (!res.body) throw new Error("No response body.");

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedResponse = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                accumulatedResponse += chunk;
                setResponse((prev) => prev + chunk); // Append the streamed chunk to the response
            }
        } catch (error) {
            console.error("Error during chat:", error);
            setResponse("An error occurred while communicating with the chatbot.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.chatbotContainer}>
            <div className={styles.chatBox}>
                <textarea
                    className={styles.inputField}
                    placeholder="Ask me anything..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    rows={3}
                    disabled={loading}
                />
                <button
                    className={`${styles.sendButton} ${loading ? styles.disabledButton : ""}`}
                    onClick={handleQuery}
                    disabled={loading}
                >
                    {loading ? "Thinking..." : "Send"}
                </button>
            </div>
            <div className={styles.responseBox}>
                {response ? <p>{response}</p> : <p>No response yet...</p>}
            </div>
        </div>
    );
};

export default Chatbot;
