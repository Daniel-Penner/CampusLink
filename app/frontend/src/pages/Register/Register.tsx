import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './Register.module.css';
import Navbar from '../../components/Navbar/Navbar';

const Register: React.FC = () => {
    const location = useLocation();
    const [email, setEmail] = useState(location.state?.email || '');

    return (
        <div className={styles.pageContainer}>
            <Navbar />
            <div className={styles.registerSection}>
                <h1>Create Your Account</h1>
                <form className={styles.form}>
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
                    />
                    <input
                        type="text"
                        placeholder="Last Name"
                        className={styles.inputField}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className={styles.inputField}
                    />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        className={styles.inputField}
                    />
                    <button type="submit" className={styles.registerButton}>Register</button>
                </form>
            </div>
        </div>
    );
};

export default Register;
