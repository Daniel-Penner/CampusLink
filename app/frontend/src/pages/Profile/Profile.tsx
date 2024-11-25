import React, { useState, useEffect, useContext } from "react";
import Navbar from "../../components/Navbar/Navbar";
import background from "../../assets/background.png"; // Background image
import { AuthContext } from "../../contexts/AuthContext";

const UpdateProfile: React.FC = () => {
    const authContext = useContext(AuthContext);
    const userId = authContext?.id || localStorage.getItem("id"); // Fallback to localStorage
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [bio, setBio] = useState("");
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setError("User ID is missing. Please log in again.");
            return;
        }

        // Fetch current user profile details on mount
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");
            try {
                const response = await fetch(`/api/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (response.ok) {
                    setFirstName(data.firstName);
                    setLastName(data.lastName);
                    setBio(data.bio || "");
                    setEmail(data.email);
                    setError(null); // Clear any errors if successful
                } else {
                    setError(data.message || "Failed to load profile.");
                }
            } catch (err) {
                setError("Server error while loading profile.");
            }
        };

        // Wrap the async call in an IIFE (Immediately Invoked Function Expression)
        (async () => {
            await fetchProfile();
        })();
    }, [userId]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) {
            setError("User ID is missing. Please log in again.");
            return;
        }
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    bio,
                    email,
                    currentPassword,
                    newPassword,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setSuccess(data.message); // Use the message returned by the route
                setError(null);

                // Update AuthContext name
                if (authContext) {
                    const updatedName = `${firstName} ${lastName}`;
                    authContext.login(token!, userId, updatedName, authContext.code || "");
                }
            } else {
                setError(data.message || "Error updating profile");
                setSuccess(null);
            }
        } catch (err) {
            setError("Server error");
            setSuccess(null);
        }
    };



    return (
        <div
            className="flex flex-col items-center justify-center w-screen h-[calc(100vh)] bg-cover p-[5%]"
            style={{ backgroundImage: `url(${background})` }}
        >
            <Navbar />
            <div className="flex flex-col items-center justify-center w-[90%] sm:w-[60%] md:w-[40%] lg:w-[30%] h-[calc(90vh-80px)] p-5 sm:p-6 lg:p-8 bg-secondaryBackground rounded-lg text-text-color">
                <h1 className="text-4xl font-bold mb-6 text-primary-color">Update Profile</h1>
                {error && <p className="text-error-color mb-4">{error}</p>}
                {success && <p className="text-green-500 mb-4">{success}</p>}
                <form className="flex flex-col w-full" onSubmit={handleUpdateProfile}>
                    <input
                        type="text"
                        placeholder="First Name"
                        className="w-full p-3 mb-4 bg-input-background text-text-color rounded-md"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Last Name"
                        className="w-full p-3 mb-4 bg-input-background text-text-color rounded-md"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                    <textarea
                        placeholder="Bio"
                        className="w-full p-3 mb-4 bg-input-background text-text-color rounded-md resize-none"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                    ></textarea>
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full p-3 mb-4 bg-input-background text-text-color rounded-md"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Current Password"
                        className="w-full p-3 mb-4 bg-input-background text-text-color rounded-md"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="New Password"
                        className="w-full p-3 mb-6 bg-input-background text-text-color rounded-md"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="w-full p-3 bg-primary text-button-text rounded-md hover:bg-button-hover"
                    >
                        Update Profile
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpdateProfile;
