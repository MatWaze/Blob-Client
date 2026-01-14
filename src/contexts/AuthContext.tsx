import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
    id: string;
    username: string;
    email: string;
    walletAddress?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User) => void;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const serverUrl = import.meta.env.VITE_SERVER_URL;

    const login = (userData: User) => {
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = async () => {
        try {
            await fetch(`${serverUrl}/api/users/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
        setUser(null);
        setIsAuthenticated(false);
    };

    const checkSession = async () => {
        try {
            const response = await fetch(`${serverUrl}/api/users/tokens`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    login(data.user);
                } else {
                    logout();
                }
            } else {
                // Only logout if explicitly unauthorized
                if (response.status === 401 || response.status === 403) {
                    logout();
                }
            }
        } catch (error) {
            console.error('Session check failed:', error);
            // Do not call logout() on network errors to prevent session destruction
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    useEffect(() => {
        checkSession();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout, checkSession }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
