import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

// Define the handle interface
export interface GameHandle {
    sendLogout: () => void;
}

const Game = forwardRef<GameHandle>((props, ref) => {
    const { user, logout } = useAuth();
    const { theme } = useTheme();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const gameUrl = import.meta.env.VITE_GAME_URL;

    // Expose functions to the parent (Dashboard)
    useImperativeHandle(ref, () => ({
        sendLogout: () =>
        {
            if (iframeRef.current && iframeRef.current.contentWindow)
            {
                iframeRef.current.contentWindow.postMessage({ type: "LOGOUT" }, "*");
            }
        }
    }));

    useEffect(() => {
        const handleMessage = (event: MessageEvent) =>
        {
            if (event.data.type === 'LOGOUT')
            {
                logout();
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // useEffect(() => {
    //     if (user && iframeRef.current && iframeRef.current.contentWindow) {
    //         iframeRef.current.contentWindow.postMessage({ type: "LOGIN", user }, "*");
    //     }
    // }, [user]);

    // useEffect(() => {
    //     if (iframeRef.current && iframeRef.current.contentWindow) {
    //         iframeRef.current.contentWindow.postMessage({ type: "THEME_CHANGE", theme }, "*");
    //     }
    // }, [theme]);

    return (
        <iframe 
            key={user?.id ?? ""}
            ref={iframeRef}
            src={gameUrl} 
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Game"
        />
    );
});

export default Game;
