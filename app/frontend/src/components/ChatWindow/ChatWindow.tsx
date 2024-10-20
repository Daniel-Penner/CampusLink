import React, { useState } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import styles from './ChatWindow.module.css';

interface ChatWindowProps {
    messages: { sender: string; content: string }[];
    selectedUser: string | null;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages: initialMessages, selectedUser }) => {
    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState(initialMessages); // Initialize with the prop messages

    if (!selectedUser) {
        return <div className={styles.chatContainer}>Select a user to chat with.</div>;
    }

    const sendMessage = () => {
        const userId = 'loggedInUserId';  // Replace this with the actual logged-in user's ID
        const conversationId = 'uniqueConversationId';  // Replace with the actual conversation ID

        const messageData = {
            sender: userId,
            recipient: selectedUser,
            content: newMessage,
            conversationId
        };

        // Send message to backend
        fetch('/api/direct-messages/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messageData)
        })
            .then(() => {
                // Add the new message to the list of messages
                setMessages(prevMessages => [
                    ...prevMessages,
                    { sender: userId, content: newMessage }
                ]);
                setNewMessage(''); // Clear the input field
            })
            .catch(err => console.log('Error sending message:', err));
    };

    let previousSender: string | null = null;

    return (
        <div className={styles.chatContainer}>
            <div className={styles.messageArea}>
                {messages.map((msg, index) => {
                    const showProfilePic = msg.sender !== 'Me' && previousSender !== msg.sender;
                    previousSender = msg.sender;

                    return (
                        <div key={index} className={msg.sender === 'Me' ? styles.sentMessage : styles.receivedMessage}>
                            {showProfilePic && (
                                <img src={'/path/to/profilePic.jpg'} alt={msg.sender} className={styles.messageProfilePic} />
                            )}
                            <p>{msg.content}</p>
                        </div>
                    );
                })}
            </div>
            <div className={styles.inputContainer}>
                <input
                    type="text"
                    placeholder={`Message to ${selectedUser}...`}
                    className={styles.messageInput}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <button className={styles.sendButton} onClick={sendMessage}><FaArrowUp /></button>
            </div>
        </div>
    );
};

export default ChatWindow;
