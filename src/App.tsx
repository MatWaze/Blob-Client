import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WindowProvider, useWindow } from './contexts/WindowContext';
import Header from './components/Header';
import WelcomeScreen from './components/WelcomeScreen';
import Window from './components/Window';
import Login from './components/Login';
import Register from './components/Register';
import Game from './components/Game';
import Profile from './components/Profile';
import ErrorBoundary from './components/ErrorBoundary';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const { closeAll } = useWindow();

  useEffect(() => {
    if (!isAuthenticated) {
      closeAll();
    }
  }, [isAuthenticated, closeAll]);

  return (
    <>
      <Header />
      <div className="main-content">
        <WelcomeScreen />
        
        <Window type="login" title="🔐 Login">
          <Login />
        </Window>
        
        <Window type="register" title="📝 Register">
          <Register />
        </Window>
        
        <Window type="game" title="🎮 Game">
          <Game />
        </Window>
        
        <Window type="profile" title="👤 Profile">
          <Profile />
        </Window>
      </div>
    </>
  );
}

import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <WindowProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </WindowProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
