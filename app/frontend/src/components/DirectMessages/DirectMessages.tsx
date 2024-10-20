import React, {useState} from 'react';
import styles from './DirectMessages.module.css';
import { FaEdit, FaSearch } from 'react-icons/fa';

interface DirectMessagesProps {
    users: {
        name: string;
        profilePic: string;
        messages: { sender: string; content: string }[];
    }[];
    setSelectedUser: React.Dispatch<React.SetStateAction<string | null>>;
    selectedUser: string | null;
}

const DirectMessages: React.FC<DirectMessagesProps> = ({ users, setSelectedUser, selectedUser }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = users.filter((user) =>
        user.name?.toLowerCase().includes(searchTerm?.toLowerCase() || '')
    );



    return (
        <div className={styles.sidebar}>
            <div className={styles.header}>
                <h2>Direct Messages</h2>
                <button className={styles.newMessageButton}>
                    <FaEdit className={styles.newMessageIcon} />
                </button>
            </div>

            <div className={styles.searchContainer}>
                <FaSearch className={styles.searchIcon} />
                <input
                    type="text"
                    className={styles.search}
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <ul className={styles.messageList}>
                {filteredUsers.map((user, index) => (
                    <li
                        key={index}
                        className={
                            user.name === selectedUser
                                ? `${styles.messageItem} ${styles.messageItemSelected}`
                                : styles.messageItem
                        }
                        onClick={() => setSelectedUser(user.name)}
                    >
                        <img src={user.profilePic} alt={user.name} className={styles.profilePic} />
                        <div className={styles.userInfo}>
                            <div className={styles.userName}>{user.name}</div>
                            <div className={styles.userMessage}>{user.messages[user.messages.length - 1].content}</div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DirectMessages;
