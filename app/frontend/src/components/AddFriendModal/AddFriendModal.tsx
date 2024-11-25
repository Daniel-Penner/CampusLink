import React, { useContext, useState } from 'react';
import styles from './AddFriendModal.module.css';
import { AuthContext } from "../../contexts/AuthContext.tsx";

interface AddFriendModalProps {
    closeModal: () => void;
    addFriend: (friendCode: string) => void;
    statusMessage: string | null; // Status message to display
}

const AddFriendModal: React.FC<AddFriendModalProps> = ({ closeModal, addFriend, statusMessage }) => {
    const authContext = useContext(AuthContext);

    if (!authContext) {
        throw new Error('AuthContext is not provided.');
    }

    const { code } = authContext;
    const [friendCode, setFriendCode] = useState('');

    const handleAddFriend = () => {
        addFriend(friendCode);
    };

    const errorKeywords = ["error", "not", "already"];
    const isErrorMessage = statusMessage
        ? errorKeywords.some(keyword => statusMessage.toLowerCase().includes(keyword))
        : false;

    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <h2>Add a Friend</h2>
                <input
                    type="text"
                    placeholder="Enter friend code"
                    value={friendCode}
                    onChange={(e) => setFriendCode(e.target.value)}
                    className={styles.input}
                />
                <button onClick={handleAddFriend} className={styles.addButton}>
                    Add Friend
                </button>

                {statusMessage && (
                    <p style={{color: isErrorMessage ? 'red' : 'green', fontSize: '0.9rem', marginTop: '10px'}}>
                        {statusMessage}
                    </p>
                )}

                <div className={styles.generateSection}>
                <p>Your friend code: {code}</p>
                </div>
                <button onClick={closeModal} className={styles.closeButton}>Close</button>
            </div>
        </div>
    );
};

export default AddFriendModal;
