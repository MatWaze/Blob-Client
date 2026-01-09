import React, { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Game: React.FC = () => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const gameUrl = import.meta.env.VITE_GAME_URL; // Or from env

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'LOGOUT') {
                // Handle logout request from game if needed
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Send login message when user changes or component mounts
    useEffect(() => {
        if (user && iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ type: "LOGIN", user }, "*");
        }
    }, [user]);

    // Send theme update when theme changes or component mounts
    useEffect(() => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ type: "THEME_CHANGE", theme }, "*");
        }
    }, [theme]);

    return (
        <iframe 
            key={user?.id ?? ""}
            ref={iframeRef}
            src={gameUrl} 
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Game"
        />
    );
};

export default Game;
