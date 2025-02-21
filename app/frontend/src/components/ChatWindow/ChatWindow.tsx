import React, { useContext, useState, useEffect, useRef } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import styles from './ChatWindow.module.css';
import { AuthContext } from "../../contexts/AuthContext.tsx";

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
    const token = localStorage.getItem('token'); // ✅ FIX: Retrieve token
    if (!authContext) {
        throw new Error('AuthContext is not provided.');
    }

    const { id } = authContext;
    const defaultProfilePicture = '/uploads/profile_pictures/default-profile.png';
    const messageAreaRef = useRef<HTMLDivElement>(null);



    // ✅ Scroll to bottom when messages update
    useEffect(() => {
        if (messageAreaRef.current) {
            messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
        }
    }, [messages]);

    if (!selectedUser) {
        return <div className={styles.chatContainer}>Select a user to chat with.</div>;
    }

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const timestamp = new Date();
        const messageData: Message = {
            sender: id as string,
            recipient: selectedUser._id,
            content: newMessage,
            timestamp,
        };

        try {
            const response = await fetch('/api/direct-messages/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify(messageData),
            });

            if (!response.ok) {
                const errorResponse = await response.json();
                console.error('Error sending message:', errorResponse);
                return;
            }

            const sentMessage = await response.json(); //

            setMessages(prevMessages => [...prevMessages, sentMessage]);
            setNewMessage('');
        } catch (err) {
            console.error('Error sending message:', err);
        }
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
