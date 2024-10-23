import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (token: string, name: string, code: string) => void;
    logout: () => void;
    name: string | null; // Name might be null if not authenticated
    code: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [name, setName] = useState<string | null>(null);
    const [code, setCode] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedName = localStorage.getItem('name');
        const code = localStorage.getItem('code');
        if (token && storedName && code) {
            setIsAuthenticated(true);
            setName(storedName); // Set the name if token and name exist
            setCode(code);
        }
    }, []);

    const login = (token: string, userName: string, code: string) => {
        localStorage.setItem('token', token);
        localStorage.setItem('name', userName); // Store the user's name
        localStorage.setItem('code', code);
        setIsAuthenticated(true);
        setName(userName);
        setCode(code);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('name'); // Remove the name as well
        localStorage.removeItem('code');
        setIsAuthenticated(false);
        setName(null);
        setCode(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, name, code }}>
            {children}
        </AuthContext.Provider>
    );
};
