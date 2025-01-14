import React, { useContext, useEffect, useState } from 'react';
import styles from './Dashboard.module.css';
import Navbar from '../../components/Navbar/Navbar';
import { AuthContext } from '../../contexts/AuthContext';
import Chatbot from '../../components/Chatbot/Chatbot';

interface Message {
    content: string;
    channelName: string;
    timestamp: string;
}

interface Server {
    name: string;
    lastActivity: string;
}

interface Location {
    name: string;
    rating: number;
}

const Dashboard: React.FC = () => {
    const authContext = useContext(AuthContext);

    if (!authContext) {
        throw new Error('AuthContext is not provided.');
    }

    const { isAuthenticated, name } = authContext;

    const [recentMessages, setRecentMessages] = useState<Message[]>([]);
    const [mostActiveServer, setMostActiveServer] = useState<Server | null>(null);
    const [topLocations, setTopLocations] = useState<Location[]>([]);

    useEffect(() => {
        if (!isAuthenticated) return;

        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        };

        fetch('/api/dashboard/info', { method: 'GET', headers })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch dashboard data.');
                return res.json();
            })
            .then((data) => {
                setRecentMessages(data.recentMessages);
                setMostActiveServer(data.mostActiveServer);
                setTopLocations(data.topLocations);
            })
            .catch((err) => console.error('Error fetching dashboard data:', err));
    }, [isAuthenticated]);

    return (
        <div className={styles.pageContainer}>
            <Navbar />
            {isAuthenticated ? (
                <>
                    <h1 className={styles.pageTitle}>Welcome, {name}</h1>
                    <div className={styles.dashboardGrid}>
                        {/* Recent Messages Section */}
                        <div className={styles.section}>
                            <h2>Recent Messages</h2>
                            <div className={styles.messageArea}>
                                {recentMessages.length > 0 ? (
                                    recentMessages.map((msg, index) => (
                                        <div
                                            key={index}
                                            className={`${styles.messageContainer} ${styles.receivedMessage}`}
                                        >
                                            <p className={styles.messageContent}>
                                                <strong>{msg.channelName}: </strong>
                                                {msg.content}
                                                <br/>
                                                <span className={styles.timestamp}>
                                                    {new Date(msg.timestamp).toLocaleString()}
                                                </span>
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p>No recent messages!</p>
                                )}
                            </div>
                            <button
                                className={styles.sectionButton}
                                onClick={() => (window.location.href = '/messages')}
                            >
                                View All Messages
                            </button>
                        </div>

                        {/* Most Active Server Section */}
                        <div className={styles.section}>
                            <h2>Most Active Server</h2>
                            {mostActiveServer ? (
                                <div>
                                    <p>
                                        <strong>{mostActiveServer.name}</strong>
                                    </p>
                                    <p className={styles.timestamp}>
                                        Last activity: {new Date(mostActiveServer.lastActivity).toLocaleString()}
                                    </p>
                                </div>
                            ) : (
                                <p>No active servers!</p>
                            )}
                            <button
                                className={styles.sectionButton}
                                onClick={() => (window.location.href = '/servers')}
                            >
                                View All Servers
                            </button>
                        </div>

                        {/* Top Rated Locations Section */}
                        <div className={styles.section}>
                            <h2>Top Rated Locations</h2>
                            <div className={styles.locationList}>
                                {topLocations.length > 0 ? (
                                    topLocations.map((location, index) => (
                                        <div
                                            key={index}
                                            className={styles.locationItem}
                                            onClick={() => console.log(`Viewing ${location.name}`)}
                                        >
                                            <p>
                                                <strong>{location.name}</strong>
                                            </p>
                                            <p className={styles.rating}>
                                                Rating: {location.rating.toFixed(1)}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p>No top-rated locations found!</p>
                                )}
                            </div>
                            <button
                                className={styles.sectionButton}
                                onClick={() => (window.location.href = '/locations')}
                            >
                                View All Locations
                            </button>
                        </div>

                        {/* Chatbot Section */}
                        <div className={styles.section}>
                            <h2>Chatbot</h2>
                            <div className={styles.chatbotContainer}>
                                <Chatbot />
                            </div>
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
