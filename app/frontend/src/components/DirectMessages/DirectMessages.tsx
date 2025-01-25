import React, { useState } from 'react';
import styles from './DirectMessages.module.css';
import { FaEdit, FaSearch } from 'react-icons/fa';

interface DirectMessagesProps {
    users: {
        _id: string;
        name: string;
        profilePicture?: string;
    }[];
    setSelectedUser: React.Dispatch<
        React.SetStateAction<{ _id: string; name: string; profilePicture?: string } | null>
    >;
    selectedUser: { _id: string; name: string; profilePicture?: string } | null;
}

const DirectMessages: React.FC<DirectMessagesProps> = ({ users, setSelectedUser, selectedUser }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const defaultProfilePicture = '/uploads/profile_pictures/default-profile.png';

    // Filter users based on the search term
    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                {filteredUsers.map((user) => (
                    <li
                        key={user._id}
                        className={
                            user._id === selectedUser?._id
                                ? `${styles.messageItem} ${styles.messageItemSelected}`
                                : styles.messageItem
                        }
                        onClick={() => setSelectedUser(user)} // Pass the full user object, including profilePic
                    >
                        <img
                            src={user.profilePicture || defaultProfilePicture}
                            alt={user.name}
                            className={styles.profilePic}
                        />
                        <div className={styles.userInfo}>
                            <div className={styles.userName}>{user.name}</div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DirectMessages;
