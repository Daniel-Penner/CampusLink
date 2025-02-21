import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import background from '../../assets/background.png';


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
                    verified: false,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.message || 'Registration failed. Please try again.');
                return;
            }

            if (response.status === 201) {
                setSuccess('Registration Successful! Please verify your email to continue.');
                setError('');
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            setError('An unexpected error occurred. Please try again.');
        }
    };

    return (
        <div
            className="flex flex-col items-center justify-center h-screen w-screen bg-cover p-[5%]"
            style={{ backgroundImage: `url(${background})` }}
        >
            <Navbar />
            <div className="flex flex-col items-center justify-center w-[90%] sm:w-[60%] md:w-[40%] lg:w-[30%] h-[calc(80vh-80px)] p-6 sm:p-8 lg:p-10 bg-secondaryBackground rounded-lg text-text text-center">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 text-primary">Create Your Account</h1>
                {error && <p className="text-error mb-4">{error}</p>}
                {success && <p className="text-green-500 mb-4">{success}</p>}
                <form className="flex flex-col w-full" onSubmit={handleRegister}>
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full p-4 text-lg bg-inputBackground text-text rounded-md mb-4"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="First Name"
                        className="w-full p-4 text-lg bg-inputBackground text-text rounded-md mb-4"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Last Name"
                        className="w-full p-4 text-lg bg-inputBackground text-text rounded-md mb-4"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-4 text-lg bg-inputBackground text-text rounded-md mb-4"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        className="w-full p-4 text-lg bg-inputBackground text-text rounded-md mb-4"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button type="submit" className="w-full p-4 bg-primary text-buttonText rounded-md hover:bg-buttonHover">
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;