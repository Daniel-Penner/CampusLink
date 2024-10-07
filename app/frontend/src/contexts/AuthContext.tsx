import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (token: string, name: string) => void;
    logout: () => void;
    name: string | null; // Name might be null if not authenticated
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [name, setName] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedName = localStorage.getItem('name');
        if (token && storedName) {
            setIsAuthenticated(true);
            setName(storedName); // Set the name if token and name exist
        }
    }, []);

    const login = (token: string, userName: string) => {
        localStorage.setItem('token', token);
        localStorage.setItem('name', userName); // Store the user's name
        setIsAuthenticated(true);
        setName(userName);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('name'); // Remove the name as well
        setIsAuthenticated(false);
        setName(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, name }}>
            {children}
        </AuthContext.Provider>
    );
};
