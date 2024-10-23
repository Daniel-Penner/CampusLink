import React, {useContext, useState} from 'react';
import styles from './AddFriendModal.module.css';
import {AuthContext} from "../../contexts/AuthContext.tsx";

interface AddFriendModalProps {
    closeModal: () => void;
    addFriend: (friendCode: string) => void;
}

const AddFriendModal: React.FC<AddFriendModalProps> = ({ closeModal, addFriend }) => {
    const authContext = useContext(AuthContext);

    // Ensure authContext is not undefined
    if (!authContext) {
        throw new Error('AuthContext is not provided.');
    }

    const { code } = authContext;
    const [friendCode, setFriendCode] = useState('');

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
                    <p>Your friend code: {code}</p>
                </div>
                <button onClick={closeModal} className={styles.closeButton}>Close</button>
            </div>
        </div>
    );
};

export default AddFriendModal;
