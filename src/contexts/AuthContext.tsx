import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface User {
    id: string;
    username: string;
    email: string;
    walletAddress?: string;
    balance: number;
    withdrawAmount: number;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    accessToken: string | null;
    login: (user: User, token: string) => void;
    updateUser: (user: User) => void;
    logout: () => Promise<void>;
    fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
    checkStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const serverUrl = import.meta.env.VITE_SERVER_URL;

    const login = (userData: User, token: string) => {
        setUser(userData);
        setAccessToken(token);
        setIsAuthenticated(true);
    };

    const updateUser = (userData: User) => {
        setUser(userData);
    };

    const logout = useCallback(async () => {
        try {
            await fetch(`${serverUrl}/api/users/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout error:', error);
        }

        setUser(null);
        setAccessToken(null);
        setIsAuthenticated(false);
    }, [serverUrl]);

    // Helper to fetch user details after getting a token
    const fetchUserProfile = async (token: string) => {
        try {
            const res = await fetch(`${serverUrl}/api/users/current/full`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.user) {
                    login(data.user, token);
                    return true;
                }
            }
        } catch (e) {
            console.error("Failed to fetch user profile", e);
        }
        return false;
    };

    const attemptRefresh = useCallback(async () => {
        try {
            // Call the new endpoint to get an access token using the HttpOnly cookie
            const response = await fetch(`${serverUrl}/api/users/token`, {
                credentials: 'include' // Important: sends the refresh token cookie
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.accessToken) {
                    // Once we have the token, we get the profile
                    await fetchUserProfile(data.accessToken);
                    return data.accessToken;
                }
            } else {
                // If 401, the refresh token is invalid/expired
                if (isAuthenticated) logout();
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            if (isAuthenticated) logout();
        }
        return null;
    }, [serverUrl, logout, isAuthenticated]);

    // Expose attemptRefresh as checkStatus
    const checkStatus = useCallback(async () => {
        await attemptRefresh();
    }, [attemptRefresh]);

    // Initial check on mount
    useEffect(() => {
        attemptRefresh();
    }, []);

    // Custom fetch wrapper that adds the token and handles 401s
    const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
        let token = accessToken;

        if (!token) {
            // Try to get a new one if we don't have one
            token = await attemptRefresh();
            if (!token) throw new Error("Not authenticated");
        }

        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };

        let response = await fetch(url, { ...options, headers });

        // If token expired (401), try to refresh once and retry
        if (response.status === 401) {
            token = await attemptRefresh();
            if (token) {
                const retryHeaders = {
                    ...options.headers,
                    'Authorization': `Bearer ${token}`
                };
                response = await fetch(url, { ...options, headers: retryHeaders });
            } else {
                logout();
            }
        }

        return response;
    };

    // Handle messages from the login iframe
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'LOGIN_SUCCESS') {
                // Login iframe reported success.
                // We now have a valid refresh token cookie.
                // Let's fetch the access token & user profile immediately.
                attemptRefresh();
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [attemptRefresh]);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, accessToken, login, updateUser, logout, fetchWithAuth, checkStatus }}>
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
