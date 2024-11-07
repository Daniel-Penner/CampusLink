import React from 'react';
import styles from './ServerChoiceModal.module.css';

interface ServerChoiceModalProps {
    onClose: () => void;
    onJoin: () => void;
    onCreate: () => void;
}

const ServerChoiceModal: React.FC<ServerChoiceModalProps> = ({ onClose, onJoin, onCreate }) => (
    <div className={styles.modalBackdrop} onClick={onClose}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Choose an Option</h2>
            <div className={styles.buttonContainer}>
                <button onClick={onJoin} className={styles.choiceButton}>Join Server</button>
                <button onClick={onCreate} className={styles.choiceButton}>Create Server</button>
            </div>
            <button onClick={onClose} className={styles.cancelButton}>Cancel</button>
        </div>
    </div>
);

export default ServerChoiceModal;
