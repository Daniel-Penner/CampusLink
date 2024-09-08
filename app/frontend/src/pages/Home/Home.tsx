import React, {useState} from 'react';
import styles from './Home.module.css';
import Navbar from '../../components/Navbar/Navbar';
import { FcGoogle } from "react-icons/fc";
import { PiUserCirclePlusLight } from "react-icons/pi";
import {useNavigate} from "react-router-dom";

const Homepage: React.FC = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const handleSignUp = () => {
        // Your existing sign-up logic
        navigate('/register', { state: { email } });
    };


    return (
        <div className={styles.pageContainer}>
            <Navbar />
            <div className={styles.signUpSection}>
                <h1>For international students</h1>
                <p>A tool for students from abroad to communicate and share things you've learned about Kelowna.</p>
                <div className={styles.inputContainer}>
                    <input
                        type="email"
                        placeholder="Email Address"
                        className={styles.inputField}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button className={styles.signUpButton} onClick={handleSignUp}>
                        <PiUserCirclePlusLight className={styles.icon}/>
                        <span>Sign Up</span>
                    </button>
                </div>
                <div className={styles.orDivider}>
                    <hr className={styles.line} />
                    <span>Or</span>
                    <hr className={styles.line} />
                </div>
                <button className={styles.googleButton}>
                    <FcGoogle className={styles.logo}/> <span>Continue with Google</span>
                </button>
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
