import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './Verification.module.css'; // Assumes you are using CSS modules

const EmailVerification: React.FC = () => {
    const { token } = useParams<{ token: string }>(); // Get the token from the URL
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await fetch(`/api/auth/verify-email/${token}`);

                if (!response.ok) {
                    const data = await response.json();
                    setError(data.message || 'Verification failed. Please try again.');
                    return;
                }

                setSuccess(true);
                setTimeout(() => navigate('/login'), 3000); // Redirect to login page after 3 seconds
            } catch (err) {
                setError('An error occurred. Please try again.');
            }
        };

        verifyEmail();
    }, [token, navigate]);

    return (
        <div className={styles.pageContainer}>
            <div className={styles.verificationSection}>
                {error ? (
                    <p className={styles.errorMessage}>{error}</p>
                ) : success ? (
                    <p className={styles.successMessage}>
                        Email verified! Redirecting to the login page...
                    </p>
                ) : (
                    <p className={styles.loadingMessage}>Verifying your email...</p>
                )}
            </div>
        </div>
    );
};

export default EmailVerification;
