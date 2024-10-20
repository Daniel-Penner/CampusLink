import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // To get token from URL and navigate after success
import styles from './NewPassword.module.css';
import Navbar from '../../components/Navbar/Navbar';
import logo from "../../assets/logoSmall.svg";

const PasswordResetForm: React.FC = () => {
    const { token } = useParams<{ token: string }>(); // Get reset token from URL params
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const navigate = useNavigate();

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const response = await fetch(`/api/auth/reset-password/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: newPassword }),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.message || 'Password reset failed. Please try again.');
                return;
            }

            const data = await response.json();
            setSuccess(data.message || 'Password successfully reset. Redirecting...');
            setError(null);

            setTimeout(() => {
                navigate('/login'); // Redirect user to login page after successful password reset
            }, 3000); // Wait for 3 seconds before redirecting

        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        }
    };

    return (
        <div className={styles.pageContainer}>
            <Navbar />
            <div className={styles.passwordResetSection}>
                <h1>Reset Your Password</h1>
                <img src={logo} alt="Logo" className={styles.logo}/>
                {error && <p className={styles.errorMessage}>{error}</p>}
                {success && <p className={styles.successMessage}>{success}</p>}
                <form className={styles.form} onSubmit={handlePasswordReset}>
                    <input
                        type="password"
                        placeholder="New Password"
                        className={styles.inputField}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        className={styles.inputField}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button type="submit" className={styles.resetButton}>Reset Password</button>
                </form>
            </div>
        </div>
    );
};

export default PasswordResetForm;
