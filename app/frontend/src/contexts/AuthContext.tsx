import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (token: string, id: string, name: string, code: string) => void;
    logout: () => void;
    name: string | null;
    code: string | null;
    id: string | null;
    theme: string;
    setTheme: (theme: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [name, setName] = useState<string | null>(null);
    const [code, setCode] = useState<string | null>(null);
    const [id, setId] = useState<string | null>(null);
    const [theme, setTheme] = useState<string>(localStorage.getItem('theme') || 'default');

    // Function to check authentication state
    const checkAuth = () => {
        const token = localStorage.getItem('token');
        const storedName = localStorage.getItem('name');
        const storedCode = localStorage.getItem('code');
        const storedId = localStorage.getItem('id');

        if (token && storedName && storedCode && storedId) {
            setIsAuthenticated(true);
            setName(storedName);
            setCode(storedCode);
            setId(storedId);
        } else {
            setIsAuthenticated(false);
            setName(null);
            setCode(null);
            setId(null);
        }
    };

    // Check authentication on mount
    useEffect(() => {
        checkAuth();

        // Listen for token removal in localStorage
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'token' || event.key === 'name' || event.key === 'code' || event.key === 'id') {
                checkAuth();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Ensure theme is applied on load
    useEffect(() => {
        document.documentElement.className = theme;
    }, [theme]);

    const changeTheme = (newTheme: string) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.className = newTheme; // Apply theme
    };

    const login = (token: string, userId: string, userName: string, userCode: string) => {
        localStorage.setItem('token', token);
        localStorage.setItem('name', userName);
        localStorage.setItem('code', userCode);
        localStorage.setItem('id', userId);
        setIsAuthenticated(true);
        setName(userName);
        setCode(userCode);
        setId(userId);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('name');
        localStorage.removeItem('code');
        localStorage.removeItem('id');
        setIsAuthenticated(false);
        setName(null);
        setCode(null);
        setId(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, name, code, id, theme, setTheme: changeTheme }}>
            {children}
        </AuthContext.Provider>
    );
};
