import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { useAuth } from './AuthContext';

interface SocketContextType {
    socket: WebSocket | null;
    isConnected: boolean;
    setRetry: (callback: () => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { accessToken, isAuthenticated } = useAuth(); // Add refreshToken
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const serverUrl = import.meta.env.VITE_SERVER_URL;

    // Store the last action to be retried
    const retryRef = useRef<(() => void) | null>(null);

    const setRetry = (callback: () => void) => {
        retryRef.current = callback;
    };

    useEffect(() => {
        if (!isAuthenticated) return;

        let ws: WebSocket | null = null;
        let reconnectTimeout: NodeJS.Timeout;
        let isActive = true;

        const connect = async () => {
            // Get fresh token before connecting
            let token = accessToken;
            
            // Try to refresh if we're reconnecting (socket was closed)
            if (!token || socket === null)
            {
                const response = await fetch(`${serverUrl}/api/users/token`,
                {
                    credentials: 'include' // Important: sends the refresh token cookie
                });

                if (response.ok)
                {
                    const data = await response.json();
                    if (data.success && data.accessToken) {
                        token = data.accessToken;
                    }
                }
                else
                {
                    console.log('Failed to refresh token, stopping reconnect');
                    return;
                }
            }

            ws = new WebSocket(`${import.meta.env.VITE_SERVER_WS_URL}/lobby?accessToken=${token}`);

            ws.onopen = () => {
                console.log('Lobby WebSocket Connected');
                setIsConnected(true);
                
                if (retryRef.current) {
                    retryRef.current();
                    retryRef.current = null;
                }
            };

            ws.onclose = () => {
                console.log('Lobby WebSocket Disconnected');
                setIsConnected(false);
                setSocket(null);

                if (isActive) {
                    console.log('Reconnecting in 1s...');
                    reconnectTimeout = setTimeout(connect, 1000);
                }
            };

            setSocket(ws);
        };

        connect();

        return () => {
            isActive = false;
            clearTimeout(reconnectTimeout);
            if (ws) {
                ws.close();
            }
        };
    }, [isAuthenticated]);

    return (
        <SocketContext.Provider value={{ socket, isConnected, setRetry }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};
