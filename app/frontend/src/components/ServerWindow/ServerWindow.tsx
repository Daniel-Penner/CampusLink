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
    const [loading, setLoading] = useState(true); // Loading state to delay rendering until messages are fetched
    const messageAreaRef = useRef<HTMLDivElement>(null);
    const authContext = useContext(AuthContext);
    const { id: userId } = authContext || {};

    useEffect(() => {
        if (messageAreaRef.current) {
            messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchSenderName = async (senderId: string): Promise<string> => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/users/${senderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                console.error(`Error fetching user ${senderId}:`, response.statusText);
                return 'Unknown';
            }

            const data = await response.json();
            return data.name || 'Unknown';
        } catch (error) {
            console.error('Error fetching sender name:', error);
            return 'Unknown';
        }
    };

    useEffect(() => {
        if (selectedChannel) {
            setLoading(true);
            socket.emit('join-channel', selectedChannel._id);

            const token = localStorage.getItem('token');
            fetch(`/api/servers/${selectedServer._id}/channels/${selectedChannel._id}/messages`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then((res) => res.json())
                .then(async (data) => {
                    const formattedMessages = await Promise.all(
                        data.map(async (msg: any) => {
                            const senderName = await fetchSenderName(msg.sender);
                            return {
                                ...msg,
                                senderName,
                                timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined
                            };
                        })
                    );
                    setMessages(formattedMessages);
                })
                .catch((err) => console.error('Error fetching messages:', err))
                .finally(() => setLoading(false));
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
            .then(() => setNewMessage(''))
            .catch((err) => console.error('Error sending message:', err));
    };

    if (loading) {
        return <div className={styles.loadingIndicator}>Loading messages...</div>;
    }

    return (
        <div className={styles.serverContainer}>
            <div className={styles.messageArea} ref={messageAreaRef}>
                {messages.map((msg, index) => (
                    <div key={index} className={`${styles.messageContainer} ${msg.sender === userId ? styles.sentMessage : styles.receivedMessage}`}>
                        <p className={styles.messageContent}>
                            {msg.sender !== userId && (
                                <strong>{msg.senderName || 'Unknown'}: </strong>
                            )}
                            {msg.content || 'No content'}
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
