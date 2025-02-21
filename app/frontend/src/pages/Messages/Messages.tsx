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
    const [unreadMessages, setUnreadMessages] = useState<{ [key: string]: number }>({});

    const authContext = useContext(AuthContext);
    if (!authContext) {
        throw new Error('AuthContext is not provided.');
    }

    const { id } = authContext;
    const token = localStorage.getItem('token');

    // 🔹 Fetch unread messages from the database when the page loads
    useEffect(() => {
        if (!token) return;

        const fetchUnreadMessages = async () => {
            try {
                const response = await fetch(`/api/connections/unread-count/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const { unreadMessages } = await response.json();
                setUnreadMessages(unreadMessages || {});
            } catch (error) {
                console.error('Error fetching unread messages:', error);
            }
        };

        // 🔹 Fetch unread message counts when the page loads
        fetchUnreadMessages();

        fetch('/api/direct-messages/messageable-friends', {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then((data) => {
                // Remove duplicate users in case of API errors
                const uniqueFriends = data.reduce((acc: MappedFriend[], friend: any) => {
                    if (!acc.some(f => f._id === friend._id)) {
                        acc.push({
                            _id: friend._id,
                            name: `${friend.firstName} ${friend.lastName}`,
                            profilePicture: friend.profilePicture || '',
                        });
                    }
                    return acc;
                }, []);

                setFriends(uniqueFriends);
            });

        socket.emit('join', id);

        socket.on('new-message', async (newMessage: Message) => {
            setMessages((prevMessages) => [...prevMessages, newMessage]);

            if (selectedUser?._id === newMessage.sender) {
                await fetch(`/api/direct-messages/mark-read/${newMessage.sender}`, {
                    method: 'POST',
                    headers: {Authorization: `Bearer ${token}`}
                });

                setUnreadMessages(prev => ({ ...prev, [newMessage.sender]: 0 }));
            } else {
                setUnreadMessages(prev => ({
                    ...prev,
                    [newMessage.sender]: (prev[newMessage.sender] || 0) + 1
                }));
            }
        });

        return () => {
            socket.off('new-message');
        };
    }, [id, selectedUser, token]);

    // 🔹 Fetch messages and mark as read when a user selects a conversation
    useEffect(() => {
        if (!selectedUser || !token) return;

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

                // 🔹 Reset unread count for the selected user
                setUnreadMessages((prev) => ({
                    ...prev,
                    [selectedUser._id]: 0
                }));

                // 🔹 Update the database to mark messages as read
                fetch(`/api/connections/mark-read/${id}/${selectedUser._id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    }
                });
            })
            .catch(err => console.error('Error fetching messages:', err));
    }, [selectedUser, id, token]);

    return (
        <div className={styles.pageContainer}>
            <Navbar />
            <div className={styles.mainContent}>
                <DirectMessages
                    users={friends}
                    setSelectedUser={setSelectedUser}
                    selectedUser={selectedUser}
                    unreadMessages={unreadMessages}
                />
                <ChatWindow
                    messages={messages}
                    setMessages={setMessages}
                    selectedUser={selectedUser}
                    setUnreadMessages={setUnreadMessages}
                />
                {selectedUser && <CallManager recipientId={selectedUser._id} />}
            </div>
        </div>
    );
};

export default MessagesPage;
