import React, { useState } from 'react';
import styles from './AddFriendModal.module.css';

interface AddFriendModalProps {
    closeModal: () => void;
    addFriend: (friendCode: string) => void;
}

const AddFriendModal: React.FC<AddFriendModalProps> = ({ closeModal, addFriend }) => {
    const [friendCode, setFriendCode] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');

    const generateCode = () => {
        // Here we generate a random friend code
        const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        setGeneratedCode(newCode);
    };

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
                <button onClick={() => addFriend(friendCode)} className={styles.addButton}>
                    Add Friend
                </button>
                <div className={styles.generateSection}>
                    <p>Your friend code: {generatedCode}</p>
                    <button onClick={generateCode} className={styles.generateButton}>
                        Generate Code
                    </button>
                </div>
                <button onClick={closeModal} className={styles.closeButton}>Close</button>
            </div>
        </div>
    );
};

export default AddFriendModal;
