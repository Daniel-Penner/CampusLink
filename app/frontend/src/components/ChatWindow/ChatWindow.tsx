import React, { useContext, useState } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import styles from './ChatWindow.module.css';
import { AuthContext } from "../../contexts/AuthContext.tsx";

interface Message {
    sender: string;
    content: string;
    timestamp: Date;
}

interface ChatWindowProps {
    messages: Message[];
    selectedUser: { _id: string; name: string; profilePic: string } | null; // Ensure profilePic is part of selectedUser
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, selectedUser, setMessages }) => {
    const [newMessage, setNewMessage] = useState(''); // State for new message

    const authContext = useContext(AuthContext);
    if (!authContext) {
        throw new Error('AuthContext is not provided.');
    }

    const { id } = authContext;

    if (!selectedUser) {
        return <div className={styles.chatContainer}>Select a user to chat with.</div>;
    }

    const sendMessage = () => {
        const timestamp = new Date(); // Add timestamp when sending the message

        if (!id) {
            console.error("No valid user ID found.");
            return;
        }

        const messageData = {
            sender: id,
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
                setMessages(prevMessages => [
                    ...prevMessages,
                    { sender: id, content: newMessage, timestamp }
                ]);
                setNewMessage(''); // Clear the input field
            })
            .catch(err => console.log('Error sending message:', err));
    };

    // Handle "Enter" key press to send message
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    };

    let previousSender: string | null = null;

    return (
        <div className={styles.chatContainer}>
            <div className={styles.messageArea}>
                {messages.map((msg, index) => {
                    const isOwnMessage = msg.sender === id;
                    const showProfilePic = !isOwnMessage && previousSender !== msg.sender;
                    previousSender = msg.sender;

                    return (
                        <div key={index} className={isOwnMessage ? styles.sentMessage : styles.receivedMessage}>
                            {!isOwnMessage && showProfilePic && (
                                <img
                                    src={selectedUser.profilePic} // Use profilePic from selectedUser
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
