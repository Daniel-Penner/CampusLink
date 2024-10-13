import React, {useContext, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import logo from "../../assets/logoSmall.svg";
import Navbar from '../../components/Navbar/Navbar';
import {AuthContext} from "../../contexts/AuthContext.tsx";

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const authContext = useContext(AuthContext);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
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
            <div className={styles.loginSection}>
                <h1>Welcome Back</h1>
                <img src={logo} alt="Logo" className={styles.logo}/>
                {error && <p className={styles.errorMessage}>{error}</p>}
                <form className={styles.form} onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="Email Address"
                        className={styles.inputField}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className={styles.inputField}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <a href="/password-reset" className={styles.forgotPassword}>Forgot Password?</a>
                    <button type="submit" className={styles.loginButton}>Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
