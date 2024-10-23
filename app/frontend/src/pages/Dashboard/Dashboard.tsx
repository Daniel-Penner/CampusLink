import React, {useContext} from 'react';
import styles from './Dashboard.module.css';
import Navbar from '../../components/Navbar/Navbar'; // Assuming you're reusing the same Navbar component
import {AuthContext} from "../../contexts/AuthContext";

const Dashboard: React.FC = () => {
    const authContext = useContext(AuthContext);

    // Ensure authContext is not undefined
    if (!authContext) {
        throw new Error('AuthContext is not provided.');
    }

    const { name, isAuthenticated } = authContext;
    return (
        <div className={styles.pageContainer}>
            <Navbar />
            {/*
            <h1 className={styles.pageTitle}>Dashboard</h1>
            <div className={styles.dashboardGrid}>
                <div className={styles.section}>
                    <h2>Unread Messages</h2>
                    <ul className={styles.messageList}>
                        <li className={styles.messageItem}>Message from John Doe</li>
                        <li className={styles.messageItem}>Message from Jane Smith</li>
                        <li className={styles.messageItem}>Message from Kevin Lee</li>
                    </ul>
                    <a href="#" className={styles.viewAllLink}>View All Messages</a>
                </div>

                <div className={styles.section}>
                    <h2>Notifications</h2>
                    <ul className={styles.notificationList}>
                        <li className={styles.notificationItem}>New comment on your post</li>
                        <li className={styles.notificationItem}>New event in Kelowna</li>
                        <li className={styles.notificationItem}>You have been added to a server</li>
                    </ul>
                    <a href="#" className={styles.viewAllLink}>View All Notifications</a>
                </div>

                <div className={styles.section}>
                    <h2>Top-Rated/Trending Locations</h2>
                    <ul className={styles.locationList}>
                        <li className={styles.locationItem}>Kelowna City Park</li>
                        <li className={styles.locationItem}>Okanagan Lake</li>
                        <li className={styles.locationItem}>Myra Canyon Trestles</li>
                    </ul>
                    <a href="#" className={styles.viewAllLink}>Explore More Locations</a>
                </div>

                <div className={styles.section}>
                    <h2>Server Activity</h2>
                    <ul className={styles.serverList}>
                        <li className={styles.serverItem}>New post in #general-chat</li>
                        <li className={styles.serverItem}>New member joined #kelowna-students</li>
                        <li className={styles.serverItem}>New event in #events</li>
                    </ul>
                    <a href="#" className={styles.viewAllLink}>View Server Details</a>
                </div>
            </div>
            */}
            {isAuthenticated ? (
            <h1>Welcome {name}</h1>
            ) : (
                <h1> Please log in or create an account before attempting to access this page</h1>
                )}

        </div>
    );
};

export default Dashboard;
