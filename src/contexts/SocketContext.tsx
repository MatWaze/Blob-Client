import React, { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface SocketContextType {
    socket: WebSocket | null;
    isConnected: boolean;
    setRetry: (callback: (ws: WebSocket) => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { accessToken, isAuthenticated } = useAuth();
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const serverUrl = import.meta.env.VITE_SERVER_URL;

    const retryRef = useRef<((ws: WebSocket) => void) | null>(null);

    const setRetry = useCallback((callback: (ws: WebSocket) => void) => {
        retryRef.current = callback;
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return;

        let ws: WebSocket | null = null;
        let reconnectTimeout: string | number | undefined | any;
        let isActive = true;

        const connect = async () => {
            // If cleanup already ran, don't connect
            if (!isActive) return;

            let token = accessToken;

            // Always fetch a fresh token on reconnect to avoid expired token issues
            try {
                const response = await fetch(`${serverUrl}/api/users/token`, {
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.accessToken) {
                        token = data.accessToken;
                    }
                } else {
                    console.log('Failed to refresh token, stopping reconnect');
                    return;
                }
            } catch (err) {
                console.error('Token fetch error:', err);
                return;
            }

            // Double-check after async fetch
            if (!isActive) return;

            ws = new WebSocket(`${import.meta.env.VITE_SERVER_WS_URL}/lobby?accessToken=${token}`);

            ws.onopen = () => {
                if (!isActive) {
                    ws?.close();
                    return;
                }

                console.log('Lobby WebSocket Connected');
                setSocket(ws);
                setIsConnected(true);

                if (retryRef.current) {
                    console.log('Executing retried action with fresh socket');
                    retryRef.current(ws!);
                    retryRef.current = null; // Clear only after execution on healthy socket
                }
            };

            ws.onclose = () => {
                console.log('Lobby WebSocket Disconnected');
                
                // Only update state and reconnect if this effect is still active
                if (isActive) {
                    setIsConnected(false);
                    setSocket(null);
                    console.log('Reconnecting in 1s...');
                    reconnectTimeout = setTimeout(connect, 1000);
                }
            };

            // DON'T call setSocket here — only set it in onopen
            // This prevents React from seeing a "new socket" that isn't open yet
        };

        connect();

        return () => {
            isActive = false;
            clearTimeout(reconnectTimeout);
            if (ws) {
                ws.close();
            }
            // Don't clear retry here — let it survive reconnects
        };
    }, [isAuthenticated]); // Only re-run when auth status changes, NOT on every token refresh

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
