import React, { useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import Navbar from '../../components/Navbar/Navbar';
import DirectMessages from '../../components/DirectMessages/DirectMessages';
import ChatWindow from '../../components/ChatWindow/ChatWindow';
import styles from './Messages.module.css';
import { AuthContext } from "../../contexts/AuthContext.tsx";
import CallManager from "../../components/CallManager/CallManager";

const socketURL = import.meta.env.SITE_ADDRESS;

const socket = io(socketURL || '', {
    path: '/socket.io',
    withCredentials: true,
    transports: ['websocket', 'polling']
});

interface Friend {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
}

interface MappedFriend {
    _id: string;
    name: string;
    profilePicture: string;
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
    profilePicture?: string;
}

const MessagesPage: React.FC = () => {
    const [friends, setFriends] = useState<MappedFriend[]>([]);
    const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [unreadMessages, setUnreadMessages] = useState<{ [key: string]: boolean }>(
        JSON.parse(localStorage.getItem('unreadMessages') || '{}') // Load from local storage on first render
    );

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
                    name: `${friend.firstName} ${friend.lastName}`,
                    profilePicture: friend.profilePicture,
                }));
                setFriends(mappedFriends);
            })
            .catch(err => console.log('Error fetching friends:', err));

        // Join the user's room on connection
        socket.emit('join', id);

        // Listen for new messages
        socket.on('new-message', (newMessage: Message) => {
            if (newMessage.sender === selectedUser?._id || newMessage.recipient === selectedUser?._id) {
                // If the message is from the selected user, add it to the chat
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            } else {
                // Otherwise, mark it as unread and save to local storage
                setUnreadMessages((prev) => {
                    const updated = { ...prev, [newMessage.sender]: true };
                    localStorage.setItem('unreadMessages', JSON.stringify(updated));
                    return updated;
                });
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
                .then(data => {
                    setMessages(data);

                    // Mark messages as read for this user and update local storage
                    setUnreadMessages((prev) => {
                        const updated = { ...prev, [selectedUser._id]: false };
                        localStorage.setItem('unreadMessages', JSON.stringify(updated));
                        return updated;
                    });
                })
                .catch(err => console.log('Error fetching messages:', err));
        }
    }, [selectedUser]);

    return (
        <div className={styles.pageContainer}>
            <Navbar />
            <div className={styles.mainContent}>
                <DirectMessages
                    users={friends}
                    setSelectedUser={setSelectedUser}
                    selectedUser={selectedUser}
                    unreadMessages={unreadMessages} // Pass unread messages state
                />
                <ChatWindow messages={messages} setMessages={setMessages} selectedUser={selectedUser} />
                {selectedUser && <CallManager recipientId={selectedUser._id} />}
            </div>
        </div>
    );
};

export default MessagesPage;
