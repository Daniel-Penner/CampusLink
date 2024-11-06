import React, { useEffect, useRef, useState, useContext } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import styles from './ServerWindow.module.css';
import { io } from 'socket.io-client';
import { AuthContext } from '../../contexts/AuthContext';

const socket = io('https://localhost', {
    path: '/socket.io',
    withCredentials: true,
    transports: ['websocket', 'polling']
});

interface Message {
    sender: string;
    senderName?: string;
    content: string;
    timestamp?: Date;
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
    selectedServer: any;
}

const ServerWindow: React.FC<ServerWindowProps> = ({ messages, setMessages, selectedChannel, selectedServer }) => {
    const [newMessage, setNewMessage] = useState('');
    const messageAreaRef = useRef<HTMLDivElement>(null);
    const authContext = useContext(AuthContext);
    const { id: userId } = authContext || {};

    useEffect(() => {
        if (messageAreaRef.current) {
            messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (selectedChannel) {
            socket.emit('join-channel', selectedChannel._id);

            const token = localStorage.getItem('token');
            fetch(`/api/servers/${selectedServer._id}/channels/${selectedChannel._id}/messages`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then((res) => res.json())
                .then(async (data) => {
                    // Fetch sender names and format timestamps
                    const formattedMessages = await Promise.all(
                        data.map(async (msg: any) => {
                            const senderName = await fetchSenderName(msg.sender); // Fetch sender's name
                            return {
                                ...msg,
                                senderName,
                                timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined
                            };
                        })
                    );
                    setMessages(formattedMessages);
                })
                .catch((err) => console.error('Error fetching messages:', err));
        }

        return () => {
            if (selectedChannel) {
                socket.emit('leave-channel', selectedChannel._id);
            }
        };
    }, [selectedChannel, selectedServer, setMessages]);

    useEffect(() => {
        if (selectedChannel) {
            socket.on('channel-message', (newMessage) => {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { ...newMessage, timestamp: new Date(newMessage.timestamp) }
                ]);
            });
        }

        return () => {
            socket.off('channel-message');
        };
    }, [selectedChannel]);

    const fetchSenderName = async (senderId: string): Promise<string> => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/users/${senderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            return data.name || 'Unknown';
        } catch (error) {
            console.error('Error fetching sender name:', error);
            return 'Unknown';
        }
    };

    const sendMessage = () => {
        if (!newMessage.trim() || !selectedChannel || !selectedServer || !userId) return;

        const messageData: Message = {
            sender: userId,
            content: newMessage,
            timestamp: new Date(),
            channel: selectedChannel._id,
            profilePic: 'your-profile-pic-url'
        };

        const token = localStorage.getItem('token');

        fetch(`/api/servers/${selectedServer._id}/channels/${selectedChannel._id}/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(messageData)
        })
            .then((res) => res.json())
            .then(async (savedMessage) => {
                const senderName = await fetchSenderName(savedMessage.sender); // Fetch sender's name
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { ...savedMessage, senderName, timestamp: new Date(savedMessage.timestamp) }
                ]);
                socket.emit('send-channel-message', savedMessage);
                setNewMessage('');
            })
            .catch((err) => console.error('Error sending message:', err));
    };

    return (
        <div className={styles.serverContainer}>
            <div className={styles.messageArea} ref={messageAreaRef}>
                {messages.map((msg, index) => (
                    <div key={index} className={`${styles.messageContainer} ${msg.sender === userId ? styles.sentMessage : styles.receivedMessage}`}>
                        <p className={styles.messageContent}>
                            <strong>{msg.senderName || 'Unknown'}: </strong>
                            {msg.content}
                            <span className={styles.timestamp}>
                                {msg.timestamp ? msg.timestamp.toLocaleTimeString() : 'Invalid date'}
                            </span>
                        </p>
                    </div>
                ))}
            </div>
            <div className={styles.inputContainer}>
                <input
                    type="text"
                    placeholder={`Message #${selectedChannel?.name}...`}
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
