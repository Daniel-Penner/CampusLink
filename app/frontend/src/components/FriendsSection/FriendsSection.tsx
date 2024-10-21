import React from 'react';
import styles from './FriendsSection.module.css';

interface Friend {
    name: string;
    profilePic: string;
    status: 'Online' | 'Offline';
    description: string;
}

const FriendsSection: React.FC<{ friends: Friend[] }> = ({ friends }) => {
    return (
        <div className={styles.friendsSection}>
            {friends.map((friend, index) => (
                <div key={index} className={styles.friendCard}>
                    <div className={styles.infoRow}>
                        <img src={friend.profilePic} alt={`${friend.name} profile`} className={styles.profilePic}/>
                        <div className={styles.info}>
                            <h2>{friend.name}</h2>
                            <p>{friend.description}</p>
                        </div>
                    </div>
                    <div className={styles.actions}>
                        <button className={styles.messageButton}>Message</button>
                        <button className={styles.callButton}>Call</button>
                        <button className={styles.unfriendButton}>Unfriend</button>
                    </div>
                    <div className={styles.activeStatus}><span className={friend.status === 'Online' ? styles.online : styles.offline}>{friend.status}</span></div>
                </div>
            ))}
        </div>
    );
};

export default FriendsSection;
