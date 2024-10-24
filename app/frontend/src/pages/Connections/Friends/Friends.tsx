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

    if (!authContext) {
        throw new Error('AuthContext is not provided.');
    }

    const { id } = authContext;
    const [friends, setFriends] = useState<Friend[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        const token = localStorage.getItem('token');

        fetch('/api/connections/friends', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
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
                    const friendsData = data.map((connection) => {
                        const isSender = connection.sender && connection.sender._id === id;
                        const friendData = isSender ? connection.recipient : connection.sender;
                        return {
                            _id: friendData._id,
                            firstName: friendData.firstName,
                            lastName: friendData.lastName,
                            profilePic: friendData.profilePic || 'default-profile-pic.png',
                            status: friendData.status || 'Offline',
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
    }, [id]);

    const filteredFriends = friends.filter((friend) =>
        `${friend.firstName} ${friend.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.friendsPage}>
            <Navbar />
            <ConnectionsNavbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <FriendsSection friends={filteredFriends} setFriends={setFriends} />
        </div>
    );
};

export default FriendsPage;
