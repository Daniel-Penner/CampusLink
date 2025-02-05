import React, { useContext } from "react";
import Navbar from "../../components/Navbar/Navbar";
import { AuthContext } from "../../contexts/AuthContext";

const themes = ["default", "light", "blue"];

const Settings: React.FC = () => {
    const authContext = useContext(AuthContext);
    if (!authContext) return null;

    const { theme, setTheme } = authContext;

    return (
        <div className="flex flex-col items-center justify-center w-screen h-screen bg-background text-text">
            <Navbar />
            <div className="w-1/2 p-6 bg-secondaryBackground rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold mb-6 text-primary">Settings</h1>
                <p className="mb-4 text-label">Choose your preferred color theme:</p>
                <div className="flex flex-wrap gap-4 justify-center">
                    {themes.map((themeOption) => (
                        <button
                            key={themeOption}
                            className={`p-3 rounded-md ${
                                theme === themeOption ? "bg-primary text-buttonText" : "bg-lighterGrey text-text"
                            } hover:bg-buttonHover transition-all`}
                            onClick={() => setTheme(themeOption)}
                        >
                            {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)} Theme
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Settings;
