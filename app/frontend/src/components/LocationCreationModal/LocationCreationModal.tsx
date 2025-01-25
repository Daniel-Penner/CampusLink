import React, { useState } from 'react';
import styles from './LocationCreationModal.module.css';

interface CreationModalProps {
    coords: { lat: number; lng: number };
    onSave: (data: { name: string; description: string; lat: number; lng: number }) => void;
    onCancel: () => void;
}

const CreationModal: React.FC<CreationModalProps> = ({ coords, onSave, onCancel }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = () => {
        if (name.trim() && description.trim()) {
            onSave({ name, description, lat: coords.lat, lng: coords.lng });
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={onCancel}>
                    &times;
                </button>
                <h2>Add New Location</h2>
                <p className={styles.promptText}>Enter the details for the new location.</p>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={styles.input}
                />
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={styles.textarea}
                />
                <div className={styles.actions}>
                    <button onClick={handleSubmit} className={styles.addLocationButton}>
                        Create
                    </button>
                    <button onClick={onCancel} className={styles.cancelButton}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreationModal;
