import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import DirectMessages from '../../components/DirectMessages/DirectMessages';
import ChatWindow from '../../components/ChatWindow/ChatWindow';
import styles from './Messages.module.css';

const MessagesPage: React.FC = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [messages, setMessages] = useState([]);

    // Fetch users from the backend
    useEffect(() => {
        fetch('/api/direct-messages/users')
            .then(res => res.json())
            .then(data => setUsers(data))
            .catch(err => console.log('Error fetching users:', err));
    }, []);

    // Fetch messages when a user is selected
    useEffect(() => {
        if (selectedUser) {
            const userId = 'loggedInUserId';  // Replace this with the actual logged-in user's ID
            fetch(`/api/direct-messages/messages/${userId}/${selectedUser}`)
                .then(res => res.json())
                .then(data => setMessages(data))
                .catch(err => console.log('Error fetching messages:', err));
        }
    }, [selectedUser]);

    return (
        <div className={styles.pageContainer}>
            <Navbar />
            <div className={styles.mainContent}>
                {/* Pass users array and setSelectedUser to DirectMessages component */}
                <DirectMessages users={users} setSelectedUser={setSelectedUser} selectedUser={selectedUser} />
                {/* Pass the selected user's messages to ChatWindow component */}
                <ChatWindow messages={messages} selectedUser={selectedUser} />
            </div>
        </div>
    );
};

export default MessagesPage;
