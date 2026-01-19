import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWindow } from '../contexts/WindowContext';
import { useTheme } from '../contexts/ThemeContext';
import logo from "../../logo.png";

const WelcomeScreen: React.FC = () => {
    const { isAuthenticated, logout } = useAuth();
    const { openWindow, activeWindows } = useWindow();
    const { theme, toggleTheme } = useTheme();


    // if (activeWindows.length > 0) return null;

    return (
        <div className="welcome-screen">
            <div className="welcome-title">
                <img src={logo} alt="Logo" className="welcome-logo"/>
            </div>
            <div className="welcome-subtitle">Choose an option to get started</div>
            <div className="welcome-buttons">
                {!isAuthenticated && (
                    <>
                        <button className="welcome-btn" onClick={() => openWindow('login')}>Login</button>
                        <button className="welcome-btn" onClick={() => openWindow('register')}>Register</button>
                    </>
                )}
                <button className="welcome-btn" disabled={!isAuthenticated} onClick={() => openWindow('game')}>Pong</button>
                <button className="welcome-btn" disabled={!isAuthenticated} onClick={() => openWindow('profile')}>Profile</button>
                <button className="welcome-btn" disabled={!isAuthenticated} onClick={() => openWindow('friends')}>Friends</button>
                {isAuthenticated && (
                    <button className="nav-btn" onClick={logout}>Logout</button>
                )}
                <div className="theme-switch-wrapper">
                    <label className="theme-switch">
                        <input type="checkbox" checked={theme === 'light'} onChange={toggleTheme} />
                        <div className="slider">
                            <span className="icon">🌙</span>
                            <span className="icon">☀️</span>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default WelcomeScreen;
