import React, { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWindow } from '../contexts/WindowContext';
import { useTheme } from '../contexts/ThemeContext';

const Login: React.FC = () => {
    const { login } = useAuth();
    const { closeWindow } = useWindow();
    const { theme } = useTheme();
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'LOGIN_SUCCESS') {
                closeWindow('login');
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [login, closeWindow]);

    return (
        <iframe 
            ref={iframeRef}
            src={`login.html?theme=${theme}`}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Login"
        />
    );
};

export default Login;
