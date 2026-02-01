import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WindowProvider, useWindow } from './contexts/WindowContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SocketProvider } from './contexts/SocketContext';
import NotificationContainer from './components/NotificationContainer';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './components/Dashboard';
import './index.css'; // You might need to create this if it's missing, or use index.css

function AppContent() {
    return (
        <div className="main-content">
            <Dashboard />
        </div>
    );
}

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <WindowProvider>
                    <ThemeProvider>
                        <SocketProvider>
                            <NotificationProvider>
                                <AppContent />
                                <NotificationContainer />
                            </NotificationProvider>
                        </SocketProvider>
                    </ThemeProvider>
                </WindowProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;
