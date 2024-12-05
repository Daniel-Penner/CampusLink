import React, { useState } from 'react';
import styles from './LocationModal.module.css';

interface Review {
    rating: number;
    text: string;
}

interface LocationModalProps {
    location: any;
    onClose: () => void;
    onAddReview: (id: number, review: Review) => void;
}

const LocationModal: React.FC<LocationModalProps> = ({ location, onClose, onAddReview }) => {
    const [newRating, setNewRating] = useState<number>(0);
    const [newReviewText, setNewReviewText] = useState<string>('');
    const [isReviewSectionVisible, setIsReviewSectionVisible] = useState<boolean>(false);

    const handleAddReview = () => {
        if (newRating > 0 && newReviewText.trim() !== '') {
            onAddReview(location.id, { rating: newRating, text: newReviewText });
            setNewRating(0);
            setNewReviewText('');
            setIsReviewSectionVisible(false); // Close the review section after submitting
        }
    };

    const toggleReviewSection = () => {
        setIsReviewSectionVisible(!isReviewSectionVisible);
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={onClose}>
                    &times;
                </button>
                <h2>{location.name}</h2>
                <p className={styles.description}>{location.description}</p>
                <h3>Reviews</h3>
                <div className={styles.reviewsList}>
                    {location.reviews && location.reviews.length > 0 ? (
                        location.reviews.map((review: Review, index: number) => (
                            <div key={index} className={styles.reviewItem}>
                                <div className={styles.rating}>
                                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                </div>
                                <p>{review.text}</p>
                            </div>
                        ))
                    ) : (
                        <p>No reviews yet. Be the first to review this location!</p>
                    )}
                </div>
                <button
                    className={styles.addReviewToggleButton}
                    onClick={toggleReviewSection}
                >
                    {isReviewSectionVisible ? 'Cancel Review' : 'Add Review'}
                </button>
                {isReviewSectionVisible && (
                    <div className={styles.reviewSection}>
                        <h4>Add Your Review</h4>
                        <div className={styles.reviewInput}>
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
                            <textarea
                                value={newReviewText}
                                onChange={(e) => setNewReviewText(e.target.value)}
                                placeholder="Write your review here..."
                                className={styles.reviewTextarea}
                            ></textarea>
                        </div>
                        <button className={styles.addReviewButton} onClick={handleAddReview}>
                            Submit Review
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LocationModal;
