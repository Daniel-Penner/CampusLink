import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './NewPassword.module.css';
import Navbar from '../../components/Navbar/Navbar';
import logo from "../../assets/logoSmall.svg";

const PasswordResetForm: React.FC = () => {
    const { token } = useParams<{ token: string }>();
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
                navigate('/login');
            }, 3000);

        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        }
    };

    return (
        <div className={styles.pageContainer}>
            <Navbar />
            <div
                className="flex flex-col items-center justify-center w-[90%] sm:w-[60%] md:w-[40%] lg:w-[30%] h-[calc(70vh-80px)] p-6 sm:p-8 lg:p-10 bg-secondaryBackground rounded-lg text-white text-center"
            >
                <h1 className="text-[6vw] sm:text-[4vw] md:text-[3vw] lg:text-[2vw] font-bold mb-8 text-primary-color">Reset Your Password</h1>
                <img src={logo} alt="Logo" className="w-[30%] mb-8" />
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {success && <p className="text-green-500 mb-4">{success}</p>}
                <form className="flex flex-col w-full" onSubmit={handlePasswordReset}>
                    <input
                        type="password"
                        placeholder="New Password"
                        data-testid="new-password"
                        className="w-full p-[3vw] sm:p-[2.5vw] md:p-[2vw] lg:p-[1vw] text-[3vw] sm:text-[2.5vw] md:text-[2vw] lg:text-[1vw] mb-4 bg-input-background text-white rounded-md"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        data-testid="confirm-password"
                        className="w-full p-[3vw] sm:p-[2.5vw] md:p-[2vw] lg:p-[1vw] text-[3vw] sm:text-[2.5vw] md:text-[2vw] lg:text-[1vw] mb-4 bg-input-background text-white rounded-md"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="w-full p-[3vw] sm:p-[2.5vw] md:p-[2vw] lg:p-[1vw] bg-primary rounded-md text-white hover:bg-button-hover transition-all"
                    >
                        Reset Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PasswordResetForm;
