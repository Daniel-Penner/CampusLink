import React, { useEffect, useRef, useState } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import styles from './ServerWindow.module.css';

interface Message {
    sender: string;
    content: string;
    timestamp: Date;
    profilePic?: string;
    channel?: string;
}

interface Channel {
    _id: string;
    name: string;
}

interface ServerWindowProps {
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    selectedChannel: Channel | null;
}

const ServerWindow: React.FC<ServerWindowProps> = ({ messages, setMessages, selectedChannel }) => {
    const [newMessage, setNewMessage] = useState('');
    const messageAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messageAreaRef.current) {
            messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = () => {
        if (!newMessage.trim() || !selectedChannel) return;

        const messageData: Message = {
            sender: 'You',
            content: newMessage,
            timestamp: new Date(),
            channel: selectedChannel._id,
            profilePic: 'your-profile-pic-url', // Replace with actual profile pic URL
        };

        setMessages(prevMessages => [...prevMessages, messageData]);
        setNewMessage('');
    };

    if (!selectedChannel) {
        return <div className={styles.noChannelSelected}>No channel selected</div>;
    }

    let previousSender: string | null = null;

    return (
        <div className={styles.serverContainer}>
            <div className={styles.messageArea} ref={messageAreaRef}>
                {messages.map((msg, index) => {
                    const isOwnMessage = msg.sender === 'You';
                    const showProfilePic = !isOwnMessage && previousSender !== msg.sender;
                    previousSender = msg.sender;

                    return (
                        <div
                            key={index}
                            className={`${styles.messageContainer} ${
                                isOwnMessage ? styles.sentMessage : styles.receivedMessage
                            }`}
                        >
                            {!isOwnMessage && showProfilePic && (
                                <img src={msg.profilePic || 'default-profile-pic.png'} alt={msg.sender} className={styles.messageProfilePic} />
                            )}
                            {!showProfilePic && (
                                <div className={styles.blocker}></div>
                            )}
                            <div className={styles.messageContent}>
                                {!isOwnMessage && showProfilePic && (
                                    <span className={styles.senderName}>{msg.sender}</span>
                                )}
                                <p className={styles.textContainer}>
                                    {msg.content}
                                    <span className={styles.timestamp}>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className={styles.inputContainer}>
                <input
                    type="text"
                    placeholder={`Message #${selectedChannel.name}...`}
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

export default ServerWindow;
