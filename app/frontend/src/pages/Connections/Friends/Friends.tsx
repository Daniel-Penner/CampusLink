import React, { useState, useEffect } from 'react';
import FriendsSection from '../../../components/FriendsSection/FriendsSection';
import ConnectionsNavbar from '../../../components/ConnectionsNavbar/ConnectionsNavbar';
import styles from './Friends.module.css';
import Navbar from "../../../components/Navbar/Navbar.tsx";


interface Friend {
    name: string;
    profilePic: string;
    status: 'Online' | 'Offline';
    description: string;
}

const FriendsPage: React.FC = () => {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');

    const filteredFriends = friends.filter((friend) =>
        friend.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

     useEffect(() => {
        fetch('/api/friends')
            .then(res => res.json())
            .then(data => setFriends(data))
            .catch(err => {
                console.error('Error fetching friends:', err);
            });
    }, []);

    return (
        <div className={styles.friendsPage}>
            <Navbar />
            <ConnectionsNavbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <FriendsSection friends={filteredFriends} />
        </div>
    );
};

export default FriendsPage;
