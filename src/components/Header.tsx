import React, { useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWindow } from '../contexts/WindowContext';
import { useTheme } from '../contexts/ThemeContext';

const Header: React.FC = () => {
    const { isAuthenticated, logout } = useAuth();
    const { openWindow } = useWindow();
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="header">
            <div className="title">BLOBULA</div>
            <div className="nav-buttons">
                <div className="theme-switch-wrapper">
                    <label className="theme-switch">
                        <input type="checkbox" checked={theme === 'light'} onChange={toggleTheme} />
                        <div className="slider">
                            <span className="icon">🌙</span>
                            <span className="icon">☀️</span>
                        </div>
                    </label>
                </div>
                {/* {!isAuthenticated && (
                    <>
                        <button className="nav-btn" onClick={() => openWindow('login')}>Login</button>
                        <button className="nav-btn" onClick={() => openWindow('register')}>Register</button>
                    </>
                )} */}
                {/* <button className="nav-btn" disabled={!isAuthenticated} onClick={() => openWindow('game')}>Pong</button>
                <button className="nav-btn" disabled={!isAuthenticated} onClick={() => openWindow('profile')}>Profile</button> */}
                {isAuthenticated && (
                    <button className="nav-btn" onClick={logout}>Logout</button>
                )}
            </div>
        </div>
    );
};

export default Header;
