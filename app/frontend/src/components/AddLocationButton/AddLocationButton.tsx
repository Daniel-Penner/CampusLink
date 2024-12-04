import React from 'react';
import { FaPlus } from 'react-icons/fa';
import styles from './AddLocationButton.module.css';

interface AddLocationButtonProps {
    onClick: () => void;
}

const AddLocationButton: React.FC<AddLocationButtonProps> = ({ onClick }) => (
    <button className={styles.addButton} onClick={onClick}>
        <FaPlus className={styles.icon} />
    </button>
);

export default AddLocationButton;
