import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import styles from './FriendsSection.module.css';

interface Friend {
    _id: string;
    firstName: string;
    lastName: string;
    profilePic?: string;
    status?: 'Online' | 'Offline';
    description?: string;
}

const FriendsSection: React.FC<{ friends: Friend[], setFriends: React.Dispatch<React.SetStateAction<Friend[]>> }> = ({ friends, setFriends }) => {
    const navigate = useNavigate(); // Initialize useNavigate for page redirection

    const handleUnfriend = async (friendId: string) => {
        const token = localStorage.getItem('token');

        if (!token) {
            console.error('No token found, please log in.');
            return;
        }

        try {
            const response = await fetch('/api/connections/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ user2Id: friendId })
            });

            if (response.ok) {
                const result = await response.json();
                console.log(result.message);

                setFriends((prevFriends) => prevFriends.filter(friend => friend._id !== friendId));
            } else {
                console.error('Failed to unfriend');
            }
        } catch (error) {
            console.error('Error unfriending:', error);
        }
    };

    // Function to handle messaging a friend
    const handleMessage = (friend: Friend) => {
        // Navigate to the messages page and pass the selected friend through state
        navigate('/messages', { state: { selectedFriend: friend } });
    };

    return (
        <div className={styles.friendsSection}>
            {friends.map((friend) => (
                <div key={friend._id} className={styles.friendCard}>
                    <div className={styles.infoRow}>
                        <img
                            src={friend.profilePic || 'default-profile-pic.png'} // Fallback to a default profile picture if not provided
                            alt={`${friend.firstName} ${friend.lastName} profile`}
                            className={styles.profilePic}
                        />
                        <div className={styles.info}>
                            <h2>{`${friend.firstName} ${friend.lastName}`}</h2> {/* Full name */}
                            <p>{friend.description || 'No description available'}</p> {/* Fallback if description is missing */}
                        </div>
                    </div>
                    <div className={styles.actions}>
                        <button className={styles.messageButton} onClick={() => handleMessage(friend)}>Message</button>
                        <button className={styles.callButton}>Call</button>
                        <button
                            className={styles.unfriendButton}
                            onClick={() => handleUnfriend(friend._id)} // Call the unfriend handler
                        >
                            Unfriend
                        </button>
                    </div>
                    <div className={styles.activeStatus}>
                        <span className={friend.status === 'Online' ? styles.online : styles.offline}>
                            {friend.status}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FriendsSection;
