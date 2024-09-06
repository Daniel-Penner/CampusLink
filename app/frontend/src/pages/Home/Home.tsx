import React from 'react';
import styles from './Home.module.css';
import Navbar from '../../components/Navbar/Navbar';

const Homepage: React.FC = () => {
    return (
        <div className={styles.pageContainer}>
            <Navbar />
            <div className={styles.signUpSection}>
                <h1>For international students</h1>
                <p>A tool for students from abroad to communicate and share things you've learned about Kelowna.</p>
                <input
                    type="email"
                    placeholder="Email Address"
                    className={styles.inputField}
                />
                <button className={styles.signUpButton}>Sign Up</button>
                <div className={styles.orDivider}>
                    <span>Or</span>
                </div>
                <button className={styles.googleButton}>Continue with Google</button>
            </div>

            {/* Green line between the sections */}
            <div className={styles.middleLine}></div>

            <div className={styles.loginSection}>
                <h2>Welcome Back</h2>
                <input
                    type="email"
                    placeholder="Enter your email"
                    className={styles.inputField}
                />
                <input
                    type="password"
                    placeholder="Enter your password"
                    className={styles.inputField}
                />
                <button className={styles.loginButton}>Log In</button>
                <a href="#" className={styles.forgotPassword}>Forgot Password?</a>
            </div>
        </div>
    );
};

export default Homepage;