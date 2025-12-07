import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWindow } from '../contexts/WindowContext';

const WelcomeScreen: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const { openWindow, activeWindows } = useWindow();

    // if (activeWindows.length > 0) return null;

    return (
        <div className="welcome-screen">
            <div className="welcome-title">BLOBULA</div>
            <div className="welcome-subtitle">Choose an option to get started</div>
            <div className="welcome-buttons">
                {!isAuthenticated && (
                    <>
                        <button className="welcome-btn" onClick={() => openWindow('login')}>Login</button>
                        <button className="welcome-btn" onClick={() => openWindow('register')}>Register</button>
                    </>
                )}
                <button className="welcome-btn" disabled={!isAuthenticated} onClick={() => openWindow('game')}>Play Game</button>
                <button className="welcome-btn" disabled={!isAuthenticated} onClick={() => openWindow('profile')}>Profile</button>
            </div>
        </div>
    );
};

export default WelcomeScreen;
