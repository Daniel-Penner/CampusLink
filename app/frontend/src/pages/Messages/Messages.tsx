import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import DirectMessages from '../../components/DirectMessages/DirectMessages';
import ChatWindow from '../../components/ChatWindow/ChatWindow';
import styles from './Messages.module.css';

interface Friend {
    _id: string;
    firstName: string;
    lastName: string;
    profilePic?: string;
    status?: 'Online' | 'Offline';
}

interface MappedFriend {
    _id: string;
    name: string;
    profilePic: string;
}

interface Message {
    sender: string;
    content: string;
    timestamp: Date;
}

const MessagesPage: React.FC = () => {
    const [friends, setFriends] = useState<MappedFriend[]>([]); // Use MappedFriend type
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);

    // Fetch friends from the /api/connections/friends endpoint
    useEffect(() => {
        const token = localStorage.getItem('token');

        fetch('/api/connections/friends', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`, // Include the token in headers
            },
        })
            .then(res => res.json())
            .then((data: Friend[]) => {
                // Map the friends to include the combined `name` field
                const mappedFriends = data.map(friend => ({
                    _id: friend._id,
                    name: `${friend.firstName} ${friend.lastName}`, // Combine firstName and lastName into name
                    profilePic: friend.profilePic || 'default-profile-pic.png', // Default profile picture if not provided
                }));
                setFriends(mappedFriends); // Set the mapped friends data
            })
            .catch(err => console.log('Error fetching friends:', err));
    }, []);

    // Fetch messages when a user (friend) is selected
    useEffect(() => {
        if (selectedUser) {
            const token = localStorage.getItem('token'); // Use token if authentication is required
            const userId = 'loggedInUserId'; // Replace this with the actual logged-in user's ID
            fetch(`/api/direct-messages/messages/${userId}/${selectedUser}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, // Include the token in headers
                },
            })
                .then(res => res.json())
                .then(data => setMessages(data))
                .catch(err => console.log('Error fetching messages:', err));
        }
    }, [selectedUser]);

    return (
        <div className={styles.pageContainer}>
            <Navbar />
            <div className={styles.mainContent}>
                <DirectMessages users={friends} setSelectedUser={setSelectedUser} selectedUser={selectedUser} />
                <ChatWindow messages={messages} setMessages={setMessages} selectedUser={selectedUser} />
            </div>
        </div>
    );
};

export default MessagesPage;
