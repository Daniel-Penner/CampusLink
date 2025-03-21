import React, { createContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
    isAuthenticated: boolean;
    login: (token: string, id: string, name: string, code: string, profilePicture?: string) => void;
    logout: () => void;
    name: string | null;
    code: string | null;
    id: string | null;
    profilePicture: string | null;
    updateProfilePicture: (newPicture: string | null) => void;
    theme: string;
    setTheme: (theme: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [name, setName] = useState<string | null>(null);
    const [code, setCode] = useState<string | null>(null);
    const [id, setId] = useState<string | null>(null);
    const [profilePicture, setProfilePicture] = useState<string | null>(localStorage.getItem("profilePicture") || null);
    const [theme, setTheme] = useState<string>(localStorage.getItem("theme") || "default");

    // Function to check authentication state
    const checkAuth = async () => {
        const token = localStorage.getItem("token");
        const storedId = localStorage.getItem("id");

        if (!token || !storedId) {
            logout();
            return;
        }

        try {
            const response = await fetch(`/api/users/${storedId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                console.error("Token is invalid or expired, logging out.");
                logout(); // Log out user if the token is invalid
                return;
            }

            const data = await response.json();
            setIsAuthenticated(true);
            setName(data.firstName);
            setCode(data.code);
            setId(storedId);
            setProfilePicture(data.profilePicture); // Update profile picture from API
            localStorage.setItem("profilePicture", data.profilePicture || "");
        } catch (error) {
            console.error("Error checking authentication:", error);
            logout();
        }
    };

    // Check authentication on mount
    useEffect(() => {
        checkAuth();

        // Listen for token removal in localStorage
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === "token" || event.key === "name" || event.key === "code" || event.key === "id") {
                checkAuth();
            }
        };

        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    // Ensure theme is applied on load
    useEffect(() => {
        document.documentElement.className = theme;
    }, [theme]);

    const changeTheme = (newTheme: string) => {
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.className = newTheme; // Apply theme
    };

    const login = (token: string, userId: string, userName: string, userCode: string, profilePicture?: string) => {
        localStorage.setItem("token", token);
        localStorage.setItem("name", userName);
        localStorage.setItem("code", userCode);
        localStorage.setItem("id", userId);

        if (profilePicture) {
            localStorage.setItem("profilePicture", profilePicture);
            setProfilePicture(profilePicture);
        }

        setIsAuthenticated(true);
        setName(userName);
        setCode(userCode);
        setId(userId);
    };


    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("name");
        localStorage.removeItem("code");
        localStorage.removeItem("id");
        localStorage.removeItem("profilePicture");
        setIsAuthenticated(false);
        setName(null);
        setCode(null);
        setId(null);
        setProfilePicture(null);
    };

    const updateProfilePicture = (newPicture: string | null) => {
        setProfilePicture(newPicture);
        if (newPicture) {
            localStorage.setItem("profilePicture", newPicture);
        } else {
            localStorage.removeItem("profilePicture");
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, name, code, id, profilePicture, theme, setTheme: changeTheme, updateProfilePicture }}>
            {children}
        </AuthContext.Provider>
    );
};
