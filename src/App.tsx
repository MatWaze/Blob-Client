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
import FriendsList from './components/FriendsList';
import GameSelector from './components/GameSelector';

function AppContent() {
	const { isAuthenticated } = useAuth();
	const { closeAll, windows } = useWindow();

	useEffect(() => {
		if (!isAuthenticated) {
			closeAll();
		}
	}, [isAuthenticated, closeAll]);

	return (
		<>
			{/* <Header /> */}
			<div className="main-content">
				<WelcomeScreen />
				
				<Window type="login" title="Login">
					<Login />
				</Window>
				
				<Window type="register" title="Register">
					<Register />
				</Window>
				
				<Window type="game" title="Pong">
					<Game />
				</Window>
				
				<Window type="profile" title="Profile">
					<Profile />
				</Window>

				<Window type="friends" title="Friends">
					<FriendsList />
				</Window>

				{Object.values(windows).map((win) => {
					// if (win.id.startsWith('chat-') && win.data) {
					// 	return (
					// 		<Window 
					// 			key={win.id} 
					// 			type={win.id} 
					// 			title={`💬 ${win.data.username}`}
					// 		>
					// 			<Chat friendId={win.data.friendId} username={win.data.username} />
					// 		</Window>
					// 	);
					// }
					if (win.id === 'game-selector' && win.data) {
						return (
							<Window 
								key={win.id} 
								type={win.id} 
								title="Invite to Game"
							>
								<GameSelector friendId={win.data.friendId} username={win.data.username} />
							</Window>
						);
					}
					return null;
				})}
			</div>
		</>
	);
}

import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SocketProvider } from './contexts/SocketContext';
import NotificationContainer from './components/NotificationContainer';

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
