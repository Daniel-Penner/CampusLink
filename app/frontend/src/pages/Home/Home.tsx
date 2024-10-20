import React, { useState, useContext } from 'react';
import styles from './Home.module.css';
import Navbar from '../../components/Navbar/Navbar';
import { FcGoogle } from "react-icons/fc";
import { PiUserCirclePlusLight } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../../contexts/AuthContext';
import logo from "../../assets/logoSmall.svg";

const Homepage: React.FC = () => {
    const [email1, setEmail1] = useState('');
    const [email2, setEmail2] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Access the AuthContext
    const authContext = useContext(AuthContext);

    const handleSignUp = () => {
        navigate('/register', { state: { email1 } });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email2, password }),
            });

            const data = await response.json();
            if (response.ok && authContext) {
                authContext.login(data.token, `${data.user.firstName} ${data.user.lastName}`);
                navigate('/dashboard'); // Redirect to dashboard after login
            } else {
                setError(data.message || 'Error logging in');
            }
        } catch (err) {
            setError('Server error');
        }
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
                        onChange={(e) => setEmail1(e.target.value)}
                    />
                    <button className={styles.signUpButton} onClick={handleSignUp}>
                        <PiUserCirclePlusLight className={styles.icon} />
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

            <div className={styles.middleLine}></div>

            <div className={styles.loginSection}>
                <h2>Welcome Back</h2>
                <img src={logo} alt="Logo" className={styles.logo}/>
                <form onSubmit={handleLogin} className={styles.form}>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className={styles.inputField}
                        value={email2}
                        onChange={(e) => setEmail2(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Enter your password"
                        className={styles.inputField}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <a href="/password-reset" className={styles.forgotPassword}>Forgot Password?</a>
                    <button className={styles.loginButton} type="submit">Log In</button>
                    {error && <p className={styles.error}>{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default Homepage;
