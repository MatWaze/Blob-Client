import React, { useState, useEffect, useCallback } from 'react';
import MainBox from './MainBox';
import SubBox from './SubBox';
import Game from './Game';
import Login from './Login';
import Register from './Register';
import GameSelector from './GameSelector'; // Import the new component
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import './Dashboard.css';

// --- Icons ---
const ProfileIcon = () => <span>🐱</span>;
const GamesIcon = () => <span>🎮</span>;
const CommunityIcon = () => <span>👥</span>;
const WalletIcon = () => <span>💰</span>;
const StatsIcon = () => <span>📊</span>;
const PongIcon = () => <span>🏓</span>;
const MafiaIcon = () => <span>🎭</span>;
const InfoIcon = () => <span>ℹ️</span>;
const LoginIcon = () => <span>🔑</span>;
const RegisterIcon = () => <span>📝</span>;

// --- Content Components ---

const WalletContent: React.FC = () => {
	const { user, fetchWithAuth, updateUser } = useAuth();
	const [walletAddress, setWalletAddress] = useState(user?.walletAddress || '');
	const [withdrawAmount, setWithdrawAmount] = useState('');
	const [msg, setMsg] = useState<{type: 'success'|'error', text: string} | null>(null);
	const serverUrl = import.meta.env.VITE_SERVER_URL;

	useEffect(() => {
		if (user) setWalletAddress(user.walletAddress || '');
	}, [user]);

	const refreshProfile = async () => {
		try {
			const res = await fetchWithAuth(`${serverUrl}/api/users/current/full`);
			if (res.ok) {
				const data = await res.json();
				if (data.success && data.user) updateUser(data.user);
			}
		} catch (e) { console.error(e); }
	};

	// Fetch current balance on mount
	useEffect(() => {
		refreshProfile();
	}, []);

	const handleUpdateWallet = async () => {
		try {
			const res = await fetchWithAuth(`${serverUrl}/api/users`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ walletAddress })
			});
			if (res.ok) {
				setMsg({ type: 'success', text: 'Wallet updated!' });
				refreshProfile();
			} else {
				setMsg({ type: 'error', text: 'Failed to update' });
			}
		} catch (e) { setMsg({ type: 'error', text: 'Error' }); }
	};

	const handleWithdraw = async () => {
		if (!withdrawAmount) return;
		try {
			const res = await fetchWithAuth(`${serverUrl}/api/transactions/withdraw`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ amount: Number(withdrawAmount) })
			});
			if (res.ok) {
				setMsg({ type: 'success', text: 'Success!' });
				setWithdrawAmount('');
				refreshProfile();
			} else {
				const data = await res.json();
				setMsg({ type: 'error', text: data.message || 'Failed' });
			}
		} catch (e) { setMsg({ type: 'error', text: 'Error' }); }
	};

	return (
		<div className="wallet-content">
			<div className="wallet-header-card">
				<h3>Balance</h3>
				<p className="balance">{(user?.balance || 0).toFixed(2)} BLOB</p>
				<span className="withdrawable">Withdrawable: {(user?.withdrawAmount || 0).toFixed(2)}</span>
			</div>
			<div className="wallet-actions">
				{msg && <div className={`wallet-msg ${msg.type}`}>{msg.text}</div>}
				<div className="input-group">
					<label>Address</label>
					<div className="input-row">
						<input value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} placeholder="0x..." />
						<button onClick={handleUpdateWallet} className="action-btn">Save</button>
					</div>
				</div>
				<div className="input-group">
					<label>Withdraw</label>
					<div className="input-row">
						<input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="0.00" />
						<button onClick={handleWithdraw} className="action-btn withdraw">Cash Out</button>
					</div>
				</div>
			</div>
		</div>
	);
};

// --- Updated Stats Layout ---
const StatsContent: React.FC = () => {
	const { fetchWithAuth } = useAuth();
	const [games, setGames] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const serverUrl = import.meta.env.VITE_SERVER_URL;

	useEffect(() => {
		const loadGames = async () => {
			try {
				const response = await fetchWithAuth(`${serverUrl}/api/tournaments`);
				if (response.ok) {
					const data = await response.json();
					setGames(data.tournaments || []);
				}
			} catch (error) { console.error(error); } finally { setLoading(false); }
		};
		loadGames();
	}, [fetchWithAuth, serverUrl]);

	if (loading) return <div>Loading...</div>;
	
	return (
		<div className="stats-content">
			<div className="game-list">
					{games.length === 0 ? <div className="empty-state">No games played yet</div> : games.map((game, i) => (
							<div key={i} className="game-item">
									<div className="game-header">
											<span>{game.gameName || `Game #${game.id}`}</span>
									</div>
									<div className="game-details">
											<div>Place: <span className={game.placementName === 'Winner' || game.placementName === '1st' ? 'text-green' : 'text-red'}>{game.placementName}</span></div>
											<div>Date: {new Date(game.createdAt).toLocaleDateString()}</div>
									</div>
							</div>
					))}
			</div>
		</div>
	);
};

// --- Updated Friends Layout with GameSelector support ---
interface UserProfile { id: string; username: string; email: string; }
interface FriendshipRequest { id: string; sender: string; }

const FriendsContent: React.FC = () => {
		const { user, fetchWithAuth } = useAuth();
		const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'add'>('friends');
		const [friends, setFriends] = useState<UserProfile[]>([]);
		const [requests, setRequests] = useState<FriendshipRequest[]>([]);
		const [targetEmail, setTargetEmail] = useState('');
		const [loading, setLoading] = useState(false);
		const [msg, setMsg] = useState<{type: 'error'|'success', text: string} | null>(null);
		
		// State to track who we are inviting
		const [inviteTarget, setInviteTarget] = useState<{id: string, username: string} | null>(null);

		const serverUrl = import.meta.env.VITE_SERVER_URL;

		const apiCall = useCallback(async (endpoint: string, method: string = 'GET', body?: any) => {
				try {
						const res = await fetchWithAuth(`${serverUrl}/api/friends${endpoint}`, {
								method: method,
								body: JSON.stringify(body),
								headers: !endpoint.includes("/accept") && method !== 'GET' ? { 'Content-Type': 'application/json' } : {}
						});
						if (res.ok) return await res.json();
				} catch (err: any) {
						setMsg({ type: 'error', text: err.message });
						return null;
				}
		}, [fetchWithAuth, serverUrl]);

		const refreshData = useCallback(async () => {
				setLoading(true);
				if (activeTab === 'friends') {
						const data = await apiCall('/');
						if (data) setFriends(data.data.map((d: { friend: UserProfile; }) => d.friend) || []);
				} else if (activeTab === 'requests') {
						const data = await apiCall('/requests');
						if (data) setRequests(data.data || []);
				}
				setLoading(false);
		}, [activeTab, apiCall]);

		useEffect(() => { if (user) refreshData(); }, [user, activeTab, refreshData]);

		const sendRequest = async (e: React.FormEvent) => {
				e.preventDefault();
				if (!targetEmail) return;
				const res = await apiCall('', 'POST', { email: targetEmail });
				if (res) {
						setMsg({ type: 'success', text: `Request sent to ${targetEmail}` });
						setTargetEmail('');
				}
		};

		const respondToRequest = async (id: string, accept: boolean) => {
				const endpoint = accept ? `/accept/${id}` : `/reject/${id}`;
				const method = accept ? 'POST' : 'DELETE';
				const res = await apiCall(endpoint, method);
				if (res) {
						setMsg({ type: 'success', text: accept ? 'Added' : 'Ignored' });
						refreshData();
				}
		};

		// --- INTERCEPT RENDER: If inviting, show GameSelector ---
		if (inviteTarget) {
				return (
						<div style={{ height: '100%' }}>
								<GameSelector 
										friendId={inviteTarget.id} 
										username={inviteTarget.username} 
										onClose={() => setInviteTarget(null)} 
								/>
						</div>
				);
		}

		return (
			<div className="friends-content-full">
				 <div className="friends-tabs">
						<button className={activeTab === 'friends' ? 'active' : ''} onClick={() => setActiveTab('friends')}>Friends</button>
						<button className={activeTab === 'requests' ? 'active' : ''} onClick={() => setActiveTab('requests')}>Requests {requests.length > 0 && `(${requests.length})`}</button>
						<button className={activeTab === 'add' ? 'active' : ''} onClick={() => setActiveTab('add')}>Add</button>
				 </div>
				 
				 {msg && <div className={`msg-banner ${msg.type}`}>{msg.text}</div>}

				 <div className="friends-list-container">
						{loading && <div>Loading...</div>}
						
						{activeTab === 'friends' && !loading && (
								<div className="simple-list">
										{friends.length === 0 && <p>No friends yet.</p>}
										{friends.map(f => (
												<div key={f.id} className="friend-row">
														<span className="name">{f.username}</span>
														<button 
																className="btn-small invite" 
																style={{ width: 'auto', padding: '0 8px', background: '#eab308' }}
																onClick={() => setInviteTarget({ id: f.id, username: f.username })}
																title="Invite to Game"
														>
																⚔️ Invite
														</button>
												</div>
										))}
								</div>
						)}

						{activeTab === 'requests' && !loading && (
								<div className="simple-list">
										{requests.length === 0 && <p>No requests.</p>}
										{requests.map(r => (
												<div key={r.id} className="request-row">
														<span className="name">{r.sender}</span>
														<div className="actions">
																<button onClick={() => respondToRequest(r.id, true)} className="btn-small accept">✓</button>
																<button onClick={() => respondToRequest(r.id, false)} className="btn-small reject">✕</button>
														</div>
												</div>
										))}
								</div>
						)}

						{activeTab === 'add' && (
								<form onSubmit={sendRequest} className="add-form">
										<input type="email" placeholder="friend@email.com" value={targetEmail} onChange={e => setTargetEmail(e.target.value)} required />
										<button type="submit">Send</button>
								</form>
						)}
				 </div>
			</div>
		);
};

// --- BloboxIcon Component ---
const BloboxIcon = () => (
	<img 
		src="../../logo.png" 
		style={{ width: '420px', height: '220px', objectFit: 'contain' }} 
		alt="Blobox" 
	/>
);

// --- Dashboard Component ---
const Dashboard: React.FC = () => {
	const { isAuthenticated, logout, user } = useAuth();
	const { theme, toggleTheme } = useTheme();
	
	// Track visibility of main windows in guest view
	const [visibleBoxes, setVisibleBoxes] = useState({
		login: true,
		blobox: true,
		about: true,
	});

	// Track if Blobox is expanded (showing auth content)
	const [bloboxExpanded, setBloboxExpanded] = useState(false);

	const reopenBox = (box: keyof typeof visibleBoxes) => {
		setVisibleBoxes(prev => ({ ...prev, [box]: true }));
	};

	const closedBoxes = Object.entries(visibleBoxes)
		.filter(([_, visible]) => !visible)
		.map(([name]) => name);

	const [pongOpen, setPongOpen] = useState(false);
	const [gamesTrigger, setGamesTrigger] = useState(0);

	// Handle game invite acceptance - open Blobox and Pong
	useEffect(() => {
		const handler = () => {
			if (isAuthenticated) {
				setBloboxExpanded(true);
				setGamesTrigger(prev => prev + 1);
				setPongOpen(false);
				setTimeout(() => setPongOpen(true), 50);
			}
		};
		window.addEventListener('RESET_GAME_VIEW', handler);
		return () => window.removeEventListener('RESET_GAME_VIEW', handler);
	}, [isAuthenticated]);

	// When user logs in, auto-expand Blobox
	useEffect(() => {
		if (isAuthenticated && !bloboxExpanded) {
			setBloboxExpanded(true);
		}
	}, [isAuthenticated]);

	// Handle Blobox click - only expand if authenticated
	const handleBloboxClick = () => {
		if (isAuthenticated) {
			setBloboxExpanded(true);
		}
	};

	// Handle closing Blobox - return to guest view
	const handleBloboxClose = () => {
		setBloboxExpanded(false);
	};

	// Determine what to show
	const showGuestWindows = !bloboxExpanded;
	const showBloboxContent = bloboxExpanded && isAuthenticated;

	return (
		<div className="dashboard">
			{/* Reopen buttons for closed guest windows */}
			{showGuestWindows && closedBoxes.length > 0 && (
				<div className="closed-boxes-bar">
					{closedBoxes.map((box) => (
						<button
							key={box}
							className="reopen-btn"
							onClick={() => reopenBox(box as keyof typeof visibleBoxes)}
						>
							Open {box.charAt(0).toUpperCase() + box.slice(1)}
						</button>
					))}
				</div>
			)}
			
			<div className="dashboard-content">
				{showBloboxContent ? (
					/* Blobox Expanded View - Wrapped in a container that looks like a parent window */
					<div className="blobox-container">
						{/* Restore button to go back to guest view */}
						<button 
							className="blobox-restore-btn" 
							onClick={handleBloboxClose}
							title="Back to Guest View"
						>
							{/* ↙ */}
						</button>

						<div className="blobox-inner">
							{/* Profile MainBox */}
							<MainBox 
								key="profile" 
								id="profile" 
								title="Profile" 
								icon={<ProfileIcon />} 
								color="#f59e0b"
							>
								<SubBox title="Wallet" icon={<WalletIcon />} color="#f59e0b">
									<WalletContent />
								</SubBox>
								<SubBox title="Statistics" icon={<StatsIcon />} color="#3b82f6">
									<StatsContent />
								</SubBox>
								<SubBox title="Account" icon={<span>👤</span>} color="#10b981">
									<div className="account-content">
										<div style={{ textAlign: 'center', marginBottom: 6 }}>
											<div className="account-info">
												<div><strong>Username:</strong> {user?.username || 'N/A'}</div>
												<div><strong>Email:</strong> {user?.email || 'N/A'}</div>
											</div>
										</div>
										<div className="theme-switch-wrapper">
											<label className="theme-switch">
												<input type="checkbox" checked={theme === 'light'} onChange={toggleTheme} />
												<div className="slider">
													<span className="icon">🌙</span>
													<span className="icon">☀️</span>
												</div>
											</label>
										</div>
										<button className="nav-btn" onClick={logout}>Logout</button>
									</div>
								</SubBox>
							</MainBox>

							{/* Games MainBox */}
							<MainBox 
								key="games" 
								id="games" 
								title="Games" 
								icon={<GamesIcon />} 
								color="#ef4444" 
								triggerOpen={gamesTrigger}
							>
								<SubBox title="Pong" icon={<PongIcon />} color="#ec4899" isOpen={pongOpen} onOpenChange={setPongOpen}>
									<div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
										<Game />
									</div>
								</SubBox>
								<SubBox title="Mafia" icon={<MafiaIcon />} color="#dc2626">
									<div style={{padding: 20, textAlign: 'center', color: 'var(--text-secondary)'}}>Coming Soon</div>
								</SubBox>
							</MainBox>

							{/* Community MainBox */}
							<MainBox 
								key="community" 
								id="community" 
								title="Community" 
								icon={<CommunityIcon />} 
								color="#3b82f6"
							>
								<SubBox title="Friends" icon={<span>👫</span>} color="#3b82f6">
									<FriendsContent />
								</SubBox>
							</MainBox>
						</div>
					</div>
				) : (
					/* Guest View - Login, Blobox (collapsed unless logged in), About */
					<>
						{/* Login Window */}
						{visibleBoxes.login && (
							<MainBox 
								key="login" 
								id="login" 
								title="Login" 
								icon={<LoginIcon />} 
								color="#f59e0b"
							>
								<SubBox title="Sign In" icon={<LoginIcon />} color="#f59e0b" defaultMaximized>
									<Login />
								</SubBox>
								<SubBox title="Create Account" icon={<RegisterIcon />} color="#6366f1" defaultMaximized>
									<Register />
								</SubBox>
							</MainBox>
						)}

						{/* Blobox Window - Shows logo, clicks to expand when authenticated */}
						{visibleBoxes.blobox && (
							<MainBox 
								key="blobox" 
								id="blobox" 
								title="Blobox" 
								icon={<BloboxIcon />} 
								color="#10b981"
								onClickWhenClosed={isAuthenticated ? handleBloboxClick : undefined}
							>
								{isAuthenticated ? (
									<SubBox 
										title="Enter Blobox"
										icon={<span>🚀</span>}
										color="#10b981" 
										defaultMaximized
									>
										<div style={{
											padding: 20, 
											display: 'flex', 
											flexDirection: 'column', 
											alignItems: 'center',
											textAlign: 'center',
											gap: 15
										}}>
											<h3>Welcome back, {user?.username}!</h3>
											<p>Click to enter your dashboard</p>
											<button 
												className="play-btn" 
												onClick={handleBloboxClick}
												style={{ padding: '12px 24px', fontSize: '16px' }}
											>
												🚀 Enter Blobox
											</button>
										</div>
									</SubBox>
								) : (
									<div className="blobox-guest-message">
										<span className="lock-icon">🔒</span>
										<h3>Welcome to Blobox</h3>
										<p>Please login to access your dashboard, games, and community features.</p>
									</div>
								)}
							</MainBox>
						)}

						{/* About Window */}
						{visibleBoxes.about && (
							<MainBox 
								key="about" 
								id="about" 
								title="About" 
								icon={<InfoIcon />} 
								color="#6366f1"
							>
								<SubBox
									title="Terms of Service"
									icon={<InfoIcon />}
									color="#2d30b7"
									defaultMaximized
								>

								</SubBox>
								<SubBox 
									title="About Blobox" 
									icon={<InfoIcon />} 
									color="#6366f1" 
									defaultMaximized
								>
									<div style={{
										padding: 20, 
										display: 'flex', 
										flexDirection: 'column', 
										alignItems: 'center',
										textAlign: 'center'
									}}>
										<h3>Welcome to Blobox</h3>
										<p>Lorem ipsum dolor sit amet...</p>
										<p style={{ marginTop: 10, color: 'var(--text-secondary)' }}>
											Play games, connect with friends, and earn rewards!
										</p>
									</div>
								</SubBox>
							</MainBox>
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default Dashboard;