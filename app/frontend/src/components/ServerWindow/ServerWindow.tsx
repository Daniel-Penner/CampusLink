import React, { useEffect, useRef, useState, useContext } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import styles from './ServerWindow.module.css';
import { io } from 'socket.io-client';
import { AuthContext } from '../../contexts/AuthContext';

const socket = io('https://campuslink.online', {
    path: '/socket.io',
    withCredentials: true,
    transports: ['websocket', 'polling']
});

interface Message {
    sender: string;
    senderName?: string;
    content: string;
    timestamp?: Date;
    senderProfilePicture?: string;
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
    selectedServer: any | null;
}

const ServerWindow: React.FC<ServerWindowProps> = ({ messages, setMessages, selectedChannel, selectedServer }) => {
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messageAreaRef = useRef<HTMLDivElement>(null);
    const authContext = useContext(AuthContext);
    const { id: userId } = authContext || {};

    const defaultProfilePicture = '/uploads/profile_pictures/default-profile.png'; // Default path

    // Scroll to the bottom when messages update
    useEffect(() => {
        if (messageAreaRef.current) {
            messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchSenderName = async (senderId: string): Promise<string> => {
        if (!senderId) return 'Unknown'; // Handle empty sender ID edge case
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/users/${senderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                console.error(`Error fetching user ${senderId}:`, response.statusText);
                return 'Unknown';
            }
            const data = await response.json();
            return data.firstName + ' ' + data.lastName || 'Unknown'; // Ensure field matches your API response
        } catch (error) {
            console.error('Error fetching sender name:', error);
            return 'Unknown';
        }
    };

    const fetchSenderProfilePicture = async (senderId: string): Promise<string> => {
        if (!senderId) return 'Unknown'; // Handle empty sender ID edge case
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/users/${senderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                console.error(`Error fetching user ${senderId} picture:`, response.statusText);
                return 'Unknown';
            }
            const data = await response.json();
            return data.profilePicture; // Ensure field matches your API response
        } catch (error) {
            console.error('Error fetching sender picture:', error);
            return 'Unknown';
        }
    };

    // Fetch messages when the channel changes
    useEffect(() => {
        if (selectedChannel && selectedServer) {
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
                            const senderProfilePicture = await fetchSenderProfilePicture(msg.sender)
                            return {
                                ...msg,
                                senderName,
                                senderProfilePicture,
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

    // Handle real-time messages
    useEffect(() => {
        if (selectedChannel) {
            socket.on('channel-message', async (newMessage) => {
                const senderName = await fetchSenderName(newMessage.sender);
                const senderProfilePicture = await fetchSenderProfilePicture(newMessage.sender);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { ...newMessage, senderName, senderProfilePicture, timestamp: new Date(newMessage.timestamp) }
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

    if (!selectedServer) {
        return (
            <div className={styles.placeholder}>
                Please select a server to start chatting.
            </div>
        );
    }

    if (!selectedChannel) {
        return (
            <div className={styles.placeholder}>
                Please select a channel within the server to view messages.
            </div>
        );
    }

    if (loading) {
        return <div className={styles.loadingIndicator}>Loading messages...</div>;
    }

    return (
        <div className={styles.serverContainer}>
            <div className={styles.messageArea} ref={messageAreaRef}>
                {messages.map((msg, index) => (
                    <div key={index}
                         className={`${styles.messageContainer} ${msg.sender === userId ? styles.sentMessage : styles.receivedMessage}`}>
                        {msg.sender !== userId && (
                            <img
                                src={msg.senderProfilePicture || defaultProfilePicture}
                                alt={`profile`}
                                className={styles.messageProfilePic}
                            />
                        )}
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
