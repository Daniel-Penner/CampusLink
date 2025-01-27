import React, { useContext, useState, useEffect, useRef } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import styles from './ChatWindow.module.css';
import { AuthContext } from "../../contexts/AuthContext.tsx";
import { io } from 'socket.io-client';

const socket = io('https://campuslink.online', {
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
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, selectedUser, setMessages }) => {
    const [newMessage, setNewMessage] = useState('');
    const authContext = useContext(AuthContext);
    if (!authContext) {
        throw new Error('AuthContext is not provided.');
    }

    const { id } = authContext;
    const defaultProfilePicture = '/uploads/profile_pictures/default-profile.png';

    // Reference for the message area div
    const messageAreaRef = useRef<HTMLDivElement>(null);

    // Listen for real-time incoming messages
    useEffect(() => {
        socket.on('new-message', (newMessage: Message) => {
            if (
                (newMessage.sender === selectedUser?._id && newMessage.recipient === id) ||
                (newMessage.sender === id && newMessage.recipient === selectedUser?._id)
            ) {
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            }
        });

        return () => {
            socket.off('new-message');
        };
    }, [selectedUser, id, setMessages]);

    // Scroll to the bottom of the message area when messages change
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

        const token = localStorage.getItem('token');
        fetch('/api/direct-messages/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(messageData)
        })
            .then(() => {
                setMessages(prevMessages => [...prevMessages]);
                setNewMessage('');
            })
            .catch(err => console.log('Error sending message:', err));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    };

    let previousSender: string | null = null;

    return (
        <div className={styles.chatContainer}>
            <div className={styles.messageArea} ref={messageAreaRef}>
                {messages.map((msg, index) => {
                    const isOwnMessage = msg.sender === id;
                    const showProfilePicture = !isOwnMessage && previousSender !== msg.sender;
                    previousSender = msg.sender;

                    return (
                        <div key={index} className={isOwnMessage ? styles.sentMessage : styles.receivedMessage}>
                            {!isOwnMessage && showProfilePicture && (
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
                    );
                })}
            </div>
            <div className={styles.inputContainer}>
                <input
                    type="text"
                    placeholder={`Message to ${selectedUser.name}...`}
                    className={styles.messageInput}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                />
                <button className={styles.sendButton} onClick={sendMessage}>
                    <FaArrowUp />
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;
