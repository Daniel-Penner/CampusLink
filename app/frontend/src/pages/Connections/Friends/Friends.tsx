import React, {useState, useEffect, useContext} from 'react';
import FriendsSection from '../../../components/FriendsSection/FriendsSection';
import ConnectionsNavbar from '../../../components/ConnectionsNavbar/ConnectionsNavbar';
import styles from './Friends.module.css';
import Navbar from "../../../components/Navbar/Navbar.tsx";
import {AuthContext} from "../../../contexts/AuthContext.tsx";

interface Friend {
    _id: string;
    firstName: string;
    lastName: string;
    profilePic?: string;
    status?: 'Online' | 'Offline';
    description?: string;
}

const FriendsPage: React.FC = () => {
    const authContext = useContext(AuthContext);

    // Ensure authContext is not undefined
    if (!authContext) {
        throw new Error('AuthContext is not provided.');
    }

    const { id } = authContext;
    const [friends, setFriends] = useState<Friend[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Fetch friends from the API and handle either `sender` or `recipient` objects
    useEffect(() => {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage

        fetch('/api/connections/friends', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` // Include the token in the headers
            }
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch friends');
                }
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    // Here, map the data to extract either the sender or recipient as a friend
                    const friendsData = data.map((connection) => {
                        const isSender = connection.sender && connection.sender._id === id; // Assuming you know the current user ID
                        const friendData = isSender ? connection.recipient : connection.sender;
                        return {
                            _id: friendData._id,
                            firstName: friendData.firstName,
                            lastName: friendData.lastName,
                            profilePic: friendData.profilePic || 'default-profile-pic.png', // Optional profile picture
                            status: friendData.status || 'Offline', // Optional status, default to 'Offline'
                            description: friendData.description,
                        };
                    });
                    setFriends(friendsData);
                } else {
                    throw new Error('Unexpected response format');
                }
            })
            .catch(err => {
                console.error('Error fetching friends:', err);
            });
    }, []);

    // Filtered friends based on search term
    const filteredFriends = friends.filter((friend) =>
        `${friend.firstName} ${friend.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.friendsPage}>
            <Navbar />
            <ConnectionsNavbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <FriendsSection friends={filteredFriends} />
        </div>
    );
};

export default FriendsPage;
