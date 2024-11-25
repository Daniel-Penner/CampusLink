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
            <div
                className="flex flex-col items-center justify-center w-[90%] sm:w-[60%] md:w-[40%] lg:w-[30%] h-[calc(70vh-80px)] p-6 sm:p-8 lg:p-10 bg-secondaryBackground rounded-lg text-white text-center"
            >
                <h1 className="text-[6vw] sm:text-[4vw] md:text-[3vw] lg:text-[2vw] font-bold mb-8 text-primary-color">Reset Your Password</h1>
                <img src={logo} alt="Logo" className="w-[30%] mb-8" />
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {success && <p className="text-green-500 mb-4">{success}</p>}
                <form className="flex flex-col w-full" onSubmit={handlePasswordReset}>
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full p-[3vw] sm:p-[2.5vw] md:p-[2vw] lg:p-[1vw] text-[3vw] sm:text-[2.5vw] md:text-[2vw] lg:text-[1vw] mb-4 bg-input-background text-white rounded-md"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="w-full p-[3vw] sm:p-[2.5vw] md:p-[2vw] lg:p-[1vw] bg-primary rounded-md text-white hover:bg-button-hover transition-all"
                    >
                        Send Reset Link
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PasswordReset;
