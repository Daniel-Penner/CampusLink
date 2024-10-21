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

const dummyFriends: Friend[] = [
    { name: 'John Doe', profilePic: 'https://i.pravatar.cc/150?img=1', status: 'Online', description: 'Dummy friend 1' },
    { name: 'Jane Doe', profilePic: 'https://i.pravatar.cc/150?img=2', status: 'Offline', description: 'Dummy friend 2' },
    { name: 'John Doe', profilePic: 'https://i.pravatar.cc/150?img=3', status: 'Online', description: 'Dummy friend 3' },
    { name: 'Jane Doe', profilePic: 'https://i.pravatar.cc/150?img=4', status: 'Offline', description: 'Dummy friend 4' },
    { name: 'John Doe', profilePic: 'https://i.pravatar.cc/150?img=5', status: 'Online', description: 'Dummy friend 5' },
    { name: 'Jane Doe', profilePic: 'https://i.pravatar.cc/150?img=6', status: 'Offline', description: 'Dummy friend 6' },
];

const FriendsPage: React.FC = () => {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');

    const filteredFriends = friends.filter((friend) =>
        friend.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

     useEffect(() => {
    /*    fetch('/api/friends')
            .then(res => res.json())
            .then(data => setFriends(data))
            .catch(err => {
                console.error('Error fetching friends:', err);
       */         // Use dummy data in case of failure
                setFriends(dummyFriends);
            });
    //}, []);

    return (
        <div className={styles.friendsPage}>
            <Navbar />
            <ConnectionsNavbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <FriendsSection friends={filteredFriends} />
        </div>
    );
};

export default FriendsPage;
