import React, { useState, useContext } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import { PiUserCirclePlusLight } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../../contexts/AuthContext';
import logo from "../../assets/logoSmall.svg";
import background from "../../assets/background.png";

const Homepage: React.FC = () => {
    const [email1, setEmail1] = useState('');
    const [email2, setEmail2] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const authContext = useContext(AuthContext);

    const handleSignUp = () => {
        navigate('/register', { state: { email: email1 } });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email2, password }),
            });

            const data = await response.json();
            if (response.ok && authContext) {
                authContext.login(
                    data.token,
                    data.user.id,
                    `${data.user.firstName} ${data.user.lastName}`,
                    data.user.friendCode
                );
                navigate('/dashboard');
            } else {
                setError(data.message || 'Error logging in');
            }
        } catch (err) {
            setError('Server error');
        }
    };

    return (
        <div
            className="flex flex-col items-center justify-center h-screen w-screen bg-cover bg-center bg-no-repeat pt-[80px]"
            style={{ backgroundImage: `url(${background})` }}
        >
            <Navbar />

            <div className="flex flex-col sm:flex-row items-stretch justify-between w-full px-4 sm:px-12 py-16 gap-8 lg:gap-16">
                {/* Sign-Up Section */}
                <div className="flex flex-col items-start justify-center w-full sm:w-[45%] rounded-lg p-6 sm:p-8 md:p-10 lg:p-12">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">For international students</h1>
                    <p className="text-lg sm:text-xl text-white mb-6">A tool for students from abroad to communicate and share things you've learned about Kelowna.</p>
                    <div className="flex items-center w-full bg-inputBackground rounded-lg">
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="flex-1 p-4 text-lg text-white bg-inputBackground rounded-l-lg"
                            value={email1}
                            onChange={(e) => setEmail1(e.target.value)}
                        />
                        <button
                            className="flex items-center justify-center bg-primary text-white px-6 py-4 rounded-r-lg hover:bg-buttonHover transition-all"
                            onClick={handleSignUp}
                        >
                            <PiUserCirclePlusLight className="mr-2 text-xl" />
                            <span>Sign Up</span>
                        </button>
                    </div>
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-[5px] bg-primary h-[80%]"></div>

                {/* Login Section */}
                <div className="flex flex-col items-center justify-center w-full sm:w-[45%]">
                    <div className="flex flex-col items-center justify-center w-full h-auto p-8 sm:p-10 lg:p-12 bg-secondaryBackground rounded-lg text-textColor">
                        <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6">Welcome Back</h2>
                        <img src={logo} alt="Logo" className="w-1/4 mx-auto mb-8" />
                        <form className="flex flex-col w-full" onSubmit={handleLogin}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full p-4 text-lg bg-inputBackground text-white rounded-md mb-4"
                                value={email2}
                                onChange={(e) => setEmail2(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="Enter your password"
                                className="w-full p-4 text-lg bg-inputBackground text-white rounded-md mb-4"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <a href="/password-reset" className="text-primary hover:underline mb-4">Forgot Password?</a>
                            <button
                                data-testid="login-button"
                                className="w-full p-4 bg-primary text-white rounded-md hover:bg-buttonHover transition-all"
                            >
                                Log In
                            </button>
                            {error && <p className="text-errorColor mt-4">{error}</p>}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Homepage;
