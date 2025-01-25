import React, { useState } from "react";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import styles from "./Chatbot.module.css";

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("");
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
                setResponse((prev) => prev + chunk);
            }
        } catch (error) {
            console.error("Error during chat:", error);
            setResponse("An error occurred while communicating with the chatbot.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.chatbotWrapper}>
            <div
                className={`${styles.chatIcon} ${isOpen ? styles.active : ""}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <IoChatbubbleEllipsesOutline size={30} />
            </div>

            {isOpen && (
                <div className={styles.chatWindow}>
                    <div className={styles.chatHeader}>
                        <h3>Chatbot</h3>
                        <button onClick={() => setIsOpen(false)} className={styles.closeButton}>
                            X
                        </button>
                    </div>
                    <div className={styles.chatContent}>
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
                        <div className={styles.responseBox}>
                            {response ? <p>{response}</p> : <p>No response yet...</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
