import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "../../assets/logoSmall.svg";
import background from "../../assets/background.png";  // Imported background image
import Navbar from '../../components/Navbar/Navbar';
import { AuthContext } from "../../contexts/AuthContext.tsx";

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [resendMessage, setResendMessage] = useState<string | null>(null);
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
                authContext.login(data.token, `${data.user.firstName} ${data.user.lastName}`, `${data.user.friendCode}`);
                navigate('/dashboard');
            } else {
                setError(data.message || 'Error logging in');
            }
        } catch (err) {
            setError('Server error');
        }
    };

    const handleResendVerification = async () => {
        try {
            const response = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            if (response.ok) {
                setResendMessage('Verification email resent successfully. Please check your inbox.');
            } else {
                setError(data.message || 'Error resending verification email');
            }
        } catch (err) {
            setError('Server error');
        }
    };

    return (
        <div
            className="flex flex-col items-center justify-center w-screen h-[calc(100vh)] bg-cover p-[5%]"
            style={{ backgroundImage: `url(${background})` }}
        >
            <Navbar />
            <div className="flex flex-col items-center justify-center w-[90%] sm:w-[60%] md:w-[40%] lg:w-[30%] h-[calc(80vh-80px)] p-5 sm:p-6 lg:p-8 bg-secondaryBackground rounded-lg text-text-color text-center">
                <h1 className="text-4xl md:text-3xl lg:text-4xl font-bold mb-5 lg:mb-8 text-primary-color">Welcome Back</h1>
                <img src={logo} alt="Logo" className="w-16 md:w-20 lg:w-24 h-auto mx-auto mb-4 lg:mb-6" />
                {error && <p className="text-error-color mb-4">{error}</p>}
                {resendMessage && <p className="text-success-color mb-4">{resendMessage}</p>}
                <form className="flex flex-col mt-4 lg:mt-6 w-full" onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full p-2 lg:p-3 text-base lg:text-lg mb-4 bg-input-background text-text-color rounded-md"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-2 lg:p-3 text-base lg:text-lg mb-4 bg-input-background text-text-color rounded-md"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <a href="/password-reset" className="text-primary-color hover:underline text-left mb-4">Forgot Password?</a>
                    <button type="submit" className="w-full p-2 lg:p-3 bg-primary text-button-text rounded-md hover:bg-button-hover">
                        Login
                    </button>
                </form>
                {error === 'This account is not yet verified' && (
                    <button onClick={handleResendVerification} className="mt-4 text-primary-color hover:underline">
                        Resend Verification Email
                    </button>
                )}
            </div>
        </div>
    );
};

export default Login;
