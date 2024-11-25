import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (token: string, id: string, name: string, code: string) => void;
    logout: () => void;
    name: string | null; // Name might be null if not authenticated
    code: string | null;
    id: string | null; // Add id to the context
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [name, setName] = useState<string | null>(null);
    const [code, setCode] = useState<string | null>(null);
    const [id, setId] = useState<string | null>(null); // Add id state

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedName = localStorage.getItem('name');
        const storedCode = localStorage.getItem('code');
        const storedId = localStorage.getItem('id'); // Retrieve id from localStorage
        if (token && storedName && storedCode && storedId) {
            setIsAuthenticated(true);
            setName(storedName); // Set the name if token and name exist
            setCode(storedCode);
            setId(storedId); // Set the id if it exists
        }
    }, []);

    const login = (token: string, userId: string, userName: string, userCode: string) => {
        localStorage.setItem('token', token);
        localStorage.setItem('name', userName); // Store the user's name
        localStorage.setItem('code', userCode);
        localStorage.setItem('id', userId); // Store the user's id
        setIsAuthenticated(true);
        setName(userName);
        setCode(userCode);
        setId(userId); // Set the id
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('name'); // Remove the name as well
        localStorage.removeItem('code');
        localStorage.removeItem('id'); // Remove the id
        setIsAuthenticated(false);
        setName(null);
        setCode(null);
        setId(null); // Clear the id
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, name, code, id }}>
            {children}
        </AuthContext.Provider>
    );
};
