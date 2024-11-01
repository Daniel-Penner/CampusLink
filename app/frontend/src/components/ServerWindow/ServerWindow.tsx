import React, { useEffect, useRef, useState } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import styles from './ServerWindow.module.css';

interface Message {
    sender: string;
    content: string;
    timestamp: Date;
    recipient?: string;
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

    // Scroll to the bottom of the message area whenever new messages are added
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
        };

        // Update messages with the new message
        setMessages(prevMessages => [...prevMessages, messageData]);
        setNewMessage('');
    };

    return (
        <div className={styles.serverContainer}>
            <div className={styles.messageArea} ref={messageAreaRef}>
                {messages.map((msg, index) => (
                    <div key={index} className={msg.sender === 'You' ? styles.sentMessage : styles.receivedMessage}>
                        <p className={styles.messageContent}>
                            <strong>{msg.sender}:</strong> {msg.content}
                            <span className={styles.timestamp}>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                        </p>
                    </div>
                ))}
            </div>
            <div className={styles.inputContainer}>
                <input
                    type="text"
                    placeholder={`Message #${selectedChannel?.name || ''}...`}
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
