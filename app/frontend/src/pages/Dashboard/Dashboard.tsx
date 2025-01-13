import React, { useContext, useEffect, useState } from "react";
import styles from "./Dashboard.module.css";
import Navbar from "../../components/Navbar/Navbar";
import { AuthContext } from "../../contexts/AuthContext";
import Chatbot from "../../components/Chatbot/Chatbot";

interface Message {
    content: string;
    senderName: string;
    timestamp: string;
}

interface Server {
    _id: string;
    name: string;
    lastActivity: string;
}

interface Location {
    _id: string;
    name: string;
    rating: number;
}

const Dashboard: React.FC = () => {
    const authContext = useContext(AuthContext);

    if (!authContext) {
        throw new Error("AuthContext is not provided.");
    }

    const { id, isAuthenticated, name } = authContext;

    const [recentMessages, setRecentMessages] = useState<Message[]>([]);
    const [activeServer, setActiveServer] = useState<Server | null>(null);
    const [topLocations, setTopLocations] = useState<Location[]>([]);

    useEffect(() => {
        if (!id || !isAuthenticated) return;

        const token = localStorage.getItem("token");
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };

        // Fetch most recent direct messages
        fetch(`/api/direct-messages/recent/${id}`, { method: "GET", headers })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch recent messages.");
                return res.json();
            })
            .then((data) => setRecentMessages(data))
            .catch((err) => console.error("Error fetching recent messages:", err));

        // Fetch server with the most recent activity
        fetch("/api/servers/recent-server", { method: "GET", headers })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch recent server.");
                return res.json();
            })
            .then((data) => {
                setActiveServer({
                    _id: data._id,
                    name: data.name,
                    lastActivity: new Date(data.timestamp).toLocaleString(),
                });
            })
            .catch((err) => console.error("Error fetching active server:", err));

        // Fetch top-rated locations
        fetch("/api/locations/top", { method: "GET", headers })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch top locations.");
                return res.json();
            })
            .then((data) => setTopLocations(data))
            .catch((err) => console.error("Error fetching top-rated locations:", err));
    }, [id, isAuthenticated]);

    return (
        <div className={styles.pageContainer}>
            <Navbar />
            {isAuthenticated ? (
                <>
                    <h1 className={styles.pageTitle}>Welcome, {name}</h1>
                    <div className={styles.dashboardGrid}>
                        {/* Chatbot Section */}
                        <div className={styles.section}>
                            <h2>Chatbot</h2>
                            <Chatbot />
                        </div>

                        {/* Most Recent Messages Section */}
                        <div className={styles.section}>
                            <h2>Recent Messages</h2>
                            {recentMessages.length > 0 ? (
                                <ul>
                                    {recentMessages.map((msg, index) => (
                                        <li key={index}>
                                            <strong>{msg.senderName}</strong>: {msg.content}
                                            <div className={styles.timestamp}>
                                                {new Date(msg.timestamp).toLocaleString()}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No recent messages!</p>
                            )}
                        </div>

                        {/* Server with Most Recent Activity Section */}
                        <div className={styles.section}>
                            <h2>Most Active Server</h2>
                            {activeServer ? (
                                <div>
                                    <p>
                                        <strong>{activeServer.name}</strong>
                                    </p>
                                    <p className={styles.timestamp}>
                                        Last activity: {activeServer.lastActivity}
                                    </p>
                                </div>
                            ) : (
                                <p>No active servers!</p>
                            )}
                        </div>

                        {/* Top Rated Locations Section */}
                        <div className={styles.section}>
                            <h2>Top Rated Locations</h2>
                            {topLocations.length > 0 ? (
                                <ul>
                                    {topLocations.map((location) => (
                                        <li key={location._id}>
                                            <p>
                                                <strong>{location.name}</strong>
                                            </p>
                                            <p>Rating: {location.rating.toFixed(1)}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No top-rated locations found!</p>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <h1>Please log in or create an account before attempting to access this page.</h1>
            )}
        </div>
    );
};

export default Dashboard;
