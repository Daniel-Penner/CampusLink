import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import styles from './ConnectionsNavbar.module.css';
import AddFriendModal from '../AddFriendModal/AddFriendModal';

const ConnectionsNavbar: React.FC<{ searchTerm: string; setSearchTerm: (term: string) => void }> = ({ searchTerm, setSearchTerm }) => {
    const navigate = useNavigate();
    const location = useLocation(); // Get the current route to highlight the active page
    const [showModal, setShowModal] = useState(false);

    const addFriend = (friendCode: string) => {
        // Logic for adding a friend with the friendCode
        console.log('Adding friend with code:', friendCode);
        setShowModal(false);
    };

    // Function to get the appropriate CSS class for active link
    const getActiveClass = (path: string) => {
        return location.pathname === path ? styles.activeLink : '';
    };

    return (
        <div className={styles.navbar}>
            {/* Navigation Links as list items */}
            <ul className={styles.navList}>
                <li className={getActiveClass('/connections')} onClick={() => navigate('/connections')}>
                    Friends
                </li>
                <li className={getActiveClass('/outgoing-requests')} onClick={() => navigate('/outgoing-requests')}>
                    Outgoing Requests
                </li>
                <li className={getActiveClass('/incoming-requests')} onClick={() => navigate('/incoming-requests')}>
                    Incoming Requests
                </li>
            </ul>

            {/* Search Bar */}
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

            {/* Add Friend Button */}
            <button className={styles.addFriendButton} onClick={() => setShowModal(true)}>
                Add Friend
            </button>

            {showModal && <AddFriendModal closeModal={() => setShowModal(false)} addFriend={addFriend} />}
        </div>
    );
};

export default ConnectionsNavbar;
