import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from '../Verification/Verification.module.css'; // Reuse the CSS module

const VerifyEmailChange: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            if (!token) {
                setError('Invalid verification token.');
                return;
            }

            try {
                const response = await fetch(`/api/users/verify-email-change/${token}`);
                const data = await response.json();

                if (!response.ok) {
                    setError(data.message || 'Verification failed.');
                } else {
                    setMessage('Email verified successfully! Redirecting...');
                    setTimeout(() => navigate('/profile'), 3000); // Redirect to profile
                }
            } catch (err) {
                setError('An error occurred. Please try again.');
            }
        })();
    }, [token, navigate]);

    return (
        <div className={styles.pageContainer}>
            <div className={styles.verificationSection}>
                {error ? (
                    <p className={styles.errorMessage}>{error}</p>
                ) : (
                    <p className={styles.successMessage}>
                        {message || 'Verifying your email...'}
                    </p>
                )}
            </div>
        </div>
    );
};

export default VerifyEmailChange;
