import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AxiosError } from 'axios';
import styles from './Register.module.css';
import Navbar from '../../components/Navbar/Navbar';


interface RegisterResponse {
    msg: string;
}


const Register: React.FC = () => {
    const location = useLocation();
    const [email, setEmail] = useState(location.state?.email || '');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState<string | null>(null);


    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();


        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }


        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: password,
                }),
            });
            console.log(response);
            if (!response.ok) {
                const data: RegisterResponse = await response.json();
                setError(data.msg || 'Registration failed. Please try again.');
                return;
            }


            if (response.status === 201) {
                setSuccess('Registration successful!');
                setError('');
                // Optionally, redirect the user to a login page
            }
        } catch (err) {
            const error = err as AxiosError<RegisterResponse>; // Type assertion with custom response type
            if (error.response && error.response.data) {
                setError(error.response.data.msg || 'Registration failed. Please try again.');
            } else {
                console.error('Unexpected error:', error);
                setError('An unexpected error occurred. Please try again.');
            }
        }
    };


    return (
        <div className={styles.pageContainer}>
            <Navbar />
            <div className={styles.registerSection}>
                <h1>Create Your Account</h1>
                {error && <p className={styles.errorMessage}>{error}</p>}
                {success && <p className={styles.successMessage}>{success}</p>}
                <form className={styles.form} onSubmit={handleRegister}>
                    <input
                        type="email"
                        placeholder="Email Address"
                        className={styles.inputField}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="First Name"
                        className={styles.inputField}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Last Name"
                        className={styles.inputField}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className={styles.inputField}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        className={styles.inputField}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button type="submit" className={styles.registerButton}>Register</button>
                </form>
            </div>
        </div>
    );
};


export default Register;