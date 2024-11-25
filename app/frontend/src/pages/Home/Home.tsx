import React, { useState, useContext } from 'react';
import styles from './Home.module.css';
import Navbar from '../../components/Navbar/Navbar';
import { FcGoogle } from "react-icons/fc";
import { PiUserCirclePlusLight } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../../contexts/AuthContext';
import logo from "../../assets/logoSmall.svg";
import background from "../../assets/background.png"; // Import the background image

const Homepage: React.FC = () => {
    const [email1, setEmail1] = useState('');
    const [email2, setEmail2] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Access the AuthContext
    const authContext = useContext(AuthContext);

    const handleSignUp = () => {
        navigate('/register', { state: { email: email1 } });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        let email = email2;
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok && authContext) {
                authContext.login(data.token, data.user.id,`${data.user.firstName} ${data.user.lastName}`, data.user.friendCode);
                navigate('/dashboard');
            } else {
                setError(data.message || 'Error logging in');
            }
        } catch (err) {
            setError('Server error');
        }
    };

    return (
        <div className={styles.pageContainer} style={{ backgroundImage: `url(${background})` }}>
            <Navbar />

            {/* Sign Up Section (Using CSS Module) */}
            <div className={styles.signUpSection}>
                <h1>For international students</h1>
                <p>A tool for students from abroad to communicate and share things you've learned about Kelowna.</p>
                <div className={styles.inputContainer}>
                    <input
                        type="email"
                        placeholder="Email Address"
                        className={styles.inputField}
                        value={email1}
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
                    <FcGoogle className={styles.logo} />
                    <span>Continue with Google</span>
                </button>
            </div>

            <div className={styles.middleLine}></div>

            {/* Login Section (Using Tailwind for Dynamic Responsiveness) */}
            <div
                className="flex flex-col items-center justify-center bg-secondaryBackground rounded-lg p-6 sm:p-8 lg:p-10 text-white lg:w-1/3"
            >
                <h2 className="text-[6vw] sm:text-[4vw] md:text-[3vw] lg:text-[2.5vw] font-bold mb-6">Welcome Back</h2>
                <img src={logo} alt="Logo" className="w-[30%] mb-8" />
                <form className="flex flex-col w-full" onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full p-[3vw] sm:p-[2.5vw] md:p-[2vw] lg:p-[1vw] text-[3vw] sm:text-[2.5vw] md:text-[2vw] lg:text-[1vw] mb-4 rounded-lg bg-input-background text-white"
                        value={email2}
                        onChange={(e) => setEmail2(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Enter your password"
                        className="w-full p-[3vw] sm:p-[2.5vw] md:p-[2vw] lg:p-[1vw] text-[3vw] sm:text-[2.5vw] md:text-[2vw] lg:text-[1vw] mb-4 rounded-lg bg-input-background text-white"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <a href="/password-reset" className="text-primary hover:underline mb-4">Forgot Password?</a>
                    <button
                        data-testid="login-button"
                        className="w-full p-[3vw] sm:p-[2.5vw] md:p-[2vw] lg:p-[1vw] bg-primary rounded-lg text-white hover:bg-button-hover transition-all"
                    >
                        Log In
                    </button>
                    {error && <p className="text-error-color mt-4">{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default Homepage;
