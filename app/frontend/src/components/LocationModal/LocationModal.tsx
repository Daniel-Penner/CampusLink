import React, { useEffect, useState } from 'react';
import styles from './LocationModal.module.css';

interface Review {
    rating: number;
    text: string;
    createdAt?: string;
}

interface LocationModalProps {
    location: any;
    onClose: () => void;
    onLocationUpdated: (updatedLocation: any) => void;
}

const LocationModal: React.FC<LocationModalProps> = ({ location, onClose, onLocationUpdated }) => {
    const [newRating, setNewRating] = useState<number>(0);
    const [newReviewText, setNewReviewText] = useState<string>('');
    const [isReviewSectionVisible, setIsReviewSectionVisible] = useState<boolean>(false);
    const [reviews, setReviews] = useState<Review[]>([]);
    const token = localStorage.getItem('token');

    useEffect(() => {

        fetch(`/api/locations/${location._id}/reviews`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch reviews: ${response.statusText}`);
                }
                return response.json();
            })
            .then((data) => setReviews(data))
            .catch((error) => console.error('Error fetching reviews:', error));
    }, [location, token]);

    const handleAddReview = () => {
        if (!location || !location._id) {
            console.error('Cannot add review: Invalid location object');
            return;
        }

        if (newRating > 0 && newReviewText.trim() !== '') {
            const review = { rating: newRating, text: newReviewText };

            fetch(`/api/locations/${location._id}/review`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(review),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`Failed to add review: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then((updatedLocation) => {
                    setReviews((prev: Review[]) => [{ rating: newRating, text: newReviewText }, ...prev]);
                    setNewRating(0);
                    setNewReviewText('');
                    setIsReviewSectionVisible(false);

                    // Call `onLocationUpdated` to update sidebar immediately
                    onLocationUpdated(updatedLocation);
                })
                .catch((error) => console.error('Error adding review:', error));
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
                <h2>{location?.name || 'Unknown Location'}</h2>
                <p className={styles.description}>{location?.description || 'No description available.'}</p>
                <h3>Reviews</h3>
                <div className={styles.reviewsList}>
                    {reviews.length > 0 ? (
                        reviews.map((review, index) => (
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
