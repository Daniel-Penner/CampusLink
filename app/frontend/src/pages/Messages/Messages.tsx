import React, {useState, useEffect, useContext} from 'react';
import { io } from 'socket.io-client';
import Navbar from '../../components/Navbar/Navbar';
import DirectMessages from '../../components/DirectMessages/DirectMessages';
import ChatWindow from '../../components/ChatWindow/ChatWindow';
import styles from './Messages.module.css';
import { AuthContext } from "../../contexts/AuthContext.tsx";

const socket = io('https://localhost', {
    path: '/socket.io',
    withCredentials: true,
    transports: ['websocket', 'polling']
});


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
    recipient: string;
    content: string;
    timestamp: Date;
}

interface SelectedUser {
    _id: string;
    name: string;
    profilePic: string; // Include profilePic in SelectedUser
}

const MessagesPage: React.FC = () => {
    const [friends, setFriends] = useState<MappedFriend[]>([]);
    const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null); // Now storing the entire user object
    const [messages, setMessages] = useState<Message[]>([]);

    const authContext = useContext(AuthContext);
    if (!authContext) {
        throw new Error('AuthContext is not provided.');
    }

    const { id } = authContext;

    useEffect(() => {
        const token = localStorage.getItem('token');

        fetch('/api/direct-messages/messageable-friends', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })
            .then(res => res.json())
            .then((data: Friend[]) => {
                const mappedFriends = data.map(friend => ({
                    _id: friend._id,
                    name: `${friend.firstName} ${friend.lastName}`, // Combine firstName and lastName into name
                    profilePic: friend.profilePic || 'default-profile-pic.png', // Default profile picture if not provided
                }));
                setFriends(mappedFriends); // Set the mapped friends data
            })
            .catch(err => console.log('Error fetching friends:', err));

    // Join the user's room on connection
        socket.emit('join', id);

        // Listen for new messages
        socket.on('new-message', (newMessage: Message) => {
            // Only add the message if it’s from or to the selected user
            if (
                newMessage.sender === selectedUser?._id ||
                newMessage.recipient === selectedUser?._id
            ) {
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            }
        });

        return () => {
            socket.off('new-message');
        };
    }, [id, selectedUser]);

    useEffect(() => {
        if (selectedUser) {
            const token = localStorage.getItem('token');
            fetch(`/api/direct-messages/messages/${id}/${selectedUser._id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
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
