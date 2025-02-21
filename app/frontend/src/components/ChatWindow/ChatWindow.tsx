import React, { useContext, useState, useEffect, useRef } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import styles from './ChatWindow.module.css';
import { AuthContext } from "../../contexts/AuthContext.tsx";
import { io } from 'socket.io-client';

const socketURL = import.meta.env.SITE_ADDRESS;
const socket = io(socketURL || '', {
    path: '/socket.io',
    withCredentials: true,
    transports: ['websocket', 'polling']
});

interface Message {
    sender: string;
    recipient: string;
    content: string;
    timestamp: Date;
}

interface ChatWindowProps {
    messages: Message[];
    selectedUser: { _id: string; name: string; profilePicture?: string } | null;
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    setUnreadMessages: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, selectedUser, setMessages, setUnreadMessages }) => {
    const [newMessage, setNewMessage] = useState('');

    const authContext = useContext(AuthContext);
    const token = localStorage.getItem('token'); // ✅ FIX: Retrieve token
    if (!authContext) {
        throw new Error('AuthContext is not provided.');
    }

    const { id } = authContext;
    const defaultProfilePicture = '/uploads/profile_pictures/default-profile.png';
    const messageAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleNewMessage = (newMessage: Message) => {
            if (
                (newMessage.sender === selectedUser?._id && newMessage.recipient === id) ||
                (newMessage.sender === id && newMessage.recipient === selectedUser?._id)
            ) {
                setMessages((prevMessages) => [...prevMessages, newMessage]);

                // ✅ Mark messages as read if they're from the selected user
                if (newMessage.sender === selectedUser?._id) {
                    fetch(`/api/direct-messages/mark-read/${selectedUser._id}`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` }
                    })
                        .catch(err => console.error('Error marking messages as read:', err));

                    // ✅ Reset unread count
                    setUnreadMessages(prev => ({ ...prev, [newMessage.sender]: 0 }));
                }
            }
        };

        socket.on('new-message', handleNewMessage);

        return () => {
            socket.off('new-message', handleNewMessage);
        };

    }, [selectedUser, id, setMessages, setUnreadMessages, token]);



    // ✅ Scroll to bottom when messages update
    useEffect(() => {
        if (messageAreaRef.current) {
            messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
        }
    }, [messages]);

    if (!selectedUser) {
        return <div className={styles.chatContainer}>Select a user to chat with.</div>;
    }

    const sendMessage = () => {
        if (!newMessage.trim()) return;
        const timestamp = new Date();

        const messageData: Message = {
            sender: id as string,
            recipient: selectedUser._id,
            content: newMessage,
            timestamp,
        };

        fetch('/api/direct-messages/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(messageData)
        })
            .then(() => {
                setMessages(prevMessages => [...prevMessages, messageData]);
                setNewMessage('');
            })
            .catch(err => console.log('Error sending message:', err));
    };

    return (
        <div className={styles.chatContainer}>
            <div className={styles.messageArea} ref={messageAreaRef}>
                {messages.map((msg, index) => (
                    <div key={index} className={msg.sender === id ? styles.sentMessage : styles.receivedMessage}>
                        {msg.sender !== id && (
                            <img
                                src={selectedUser.profilePicture || defaultProfilePicture}
                                alt={selectedUser.name}
                                className={styles.messageProfilePic}
                            />
                        )}
                        <p className={styles.messageContent}>
                            {msg.content}
                            <span className={styles.timestamp}>{new Date(msg.timestamp).toLocaleString()}</span>
                        </p>
                    </div>
                ))}
            </div>
            <div className={styles.inputContainer}>
                <input
                    type="text"
                    placeholder={`Message ${selectedUser.name}...`}
                    className={styles.messageInput}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button className={styles.sendButton} onClick={sendMessage}>
                    <FaArrowUp />
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;
