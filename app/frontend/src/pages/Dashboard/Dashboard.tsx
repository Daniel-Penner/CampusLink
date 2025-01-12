import React, { useContext } from "react";
import styles from "./Dashboard.module.css";
import Navbar from "../../components/Navbar/Navbar";
import { AuthContext } from "../../contexts/AuthContext";
import Chatbot from "../../components/Chatbot/Chatbot"; // Import the chatbot component

const Dashboard: React.FC = () => {
    const authContext = useContext(AuthContext);

    // Ensure authContext is not undefined
    if (!authContext) {
        throw new Error("AuthContext is not provided.");
    }

    const { name, isAuthenticated } = authContext;

    return (
        <div className={styles.pageContainer}>
            <Navbar />
            {isAuthenticated ? (
                <>
                    <h1 className={styles.pageTitle}>Welcome, {name}</h1>
                    <div className={styles.dashboardGrid}>
                        {/* Add chatbot as one of the sections */}
                        <div className={styles.section}>
                            <h2>Chatbot</h2>
                            <Chatbot />
                        </div>

                        {/* Placeholder sections for future dashboard components */}
                        <div className={styles.section}>
                            <h2>Notifications</h2>
                            <p>No notifications yet!</p>
                        </div>
                        <div className={styles.section}>
                            <h2>Your Messages</h2>
                            <p>No messages yet!</p>
                        </div>
                        <div className={styles.section}>
                            <h2>Server Updates</h2>
                            <p>No updates yet!</p>
                        </div>
                    </div>
                </>
            ) : (
                <h1>
                    Please log in or create an account before attempting to access this
                    page.
                </h1>
            )}
        </div>
    );
};

export default Dashboard;
