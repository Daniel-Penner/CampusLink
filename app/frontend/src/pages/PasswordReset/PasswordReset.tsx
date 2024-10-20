import React, { useState } from 'react';
import styles from './PasswordReset.module.css';
import Navbar from '../../components/Navbar/Navbar';
import logo from "../../assets/logoSmall.svg";

const PasswordReset: React.FC = () => {
    const [email, setEmail] = useState('');
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.message || 'Password reset failed. Please try again.');
                return;
            }
            const data = await response.json();
            setSuccess(data.message || 'Password reset link sent! Please check your email.');
            console.log(data.message);
            setError(null);
            return;
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
                        type="email"
                        placeholder="Email Address"
                        className={styles.inputField}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button type="submit" className={styles.resetButton}>Send Reset Link</button>
                </form>
            </div>
        </div>
    );
};

export default PasswordReset;
