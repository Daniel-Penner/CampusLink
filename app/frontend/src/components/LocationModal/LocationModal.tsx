import React, { useState } from 'react';
import styles from './LocationModal.module.css';

interface LocationModalProps {
    location: any;
    onClose: () => void;
    onAddRating: (id: number, newRating: number) => void;
}

const LocationModal: React.FC<LocationModalProps> = ({ location, onClose, onAddRating }) => {
    const [newRating, setNewRating] = useState<number>(0);

    const handleAddRating = () => {
        if (newRating > 0) {
            onAddRating(location.id, newRating);
            setNewRating(0);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={onClose}>
                    &times;
                </button>
                <h2>{location.name}</h2>
                <img src={location.image} alt={location.name} className={styles.image} />
                <p>{location.description}</p>
                <div className={styles.ratingSection}>
                    <h3>Add Your Rating</h3>
                    <select
                        value={newRating}
                        onChange={(e) => setNewRating(parseInt(e.target.value))}
                        className={styles.ratingSelect}
                    >
                        <option value={0}>Select Rating</option>
                        {[1, 2, 3, 4, 5].map((rating) => (
                            <option key={rating} value={rating}>
                                {rating} Star{rating > 1 ? 's' : ''}
                            </option>
                        ))}
                    </select>
                    <button className={styles.addRatingButton} onClick={handleAddRating}>
                        Add Rating
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LocationModal;
