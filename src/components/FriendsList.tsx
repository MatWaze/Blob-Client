import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './FriendsList.css';
import { useWindow } from '../contexts/WindowContext';

interface UserProfile {
	id: string;
	username: string;
	email: string;
	// alias?: string;
	// avatarUrl?: string;
	// status?: 'online' | 'offline' | 'in-game';
}

interface FriendshipRequest {
	id: string;
	createdAt: string;
	sender: string;
}

interface FriendsListProps {
	onInvite?: (friendId: string) => void;
}

const FriendsList: React.FC<FriendsListProps> = ({ onInvite }) => {
	const { user, fetchWithAuth } = useAuth();
	const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'add'>('friends');
	const { openWindow, activeWindows, windows } = useWindow();
	
	const [friends, setFriends] = useState<UserProfile[]>([]);
	const [requests, setRequests] = useState<FriendshipRequest[]>([]);
	const [targetEmail, setTargetEmail] = useState('');
	
	const [loading, setLoading] = useState(false);
	const [msg, setMsg] = useState<{type: 'error'|'success', text: string} | null>(null);

	const serverUrl = import.meta.env.VITE_SERVER_URL;

	// --- API Helpers ---
	const apiCall = useCallback(async (endpoint: string, method: string = 'GET', body?: any) => {
		try {
			// Change fetch to fetchWithAuth
			// Removed 'credentials: include' because fetchWithAuth handles it or headers are sufficient
			// But fetchWithAuth forwards options, so we can keep credentials just in case, 
			// though 'Authorization' header is the main auth now.
			const res = await fetchWithAuth(`${serverUrl}/api/friends${endpoint}`, {
				method: method,
				body: JSON.stringify(body),
				headers:
				!endpoint.includes("/accept") && method !== 'GET' // Only add content-type for body requests
				?
				{ 'Content-Type': 'application/json' }
				:
				{}
			});
			if (res.ok)
			{
				const data = await res.json();

				return data;
			}
			// throw new Error(data.error || 'Request failed');
		} catch (err: any) {
			console.error(err);
			setMsg({ type: 'error', text: err.message });
			return null;
		}
	}, []);

	// --- Data Fetching ---
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

	useEffect(() => {
		if (user) refreshData();
	}, [user, activeTab, refreshData]);

	// --- Actions ---
	const sendRequest = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!targetEmail) return;
		
		// Sending { email } instead of userId
		const res = await apiCall('', 'POST', { email: targetEmail });
		if (res) {
			setMsg({ type: 'success', text: `Friend request sent to ${targetEmail}!` });
			setTargetEmail('');
		}
	};

	const respondToRequest = async (friendshipId: string, accept: boolean) => {
		const endpoint = accept ? `/accept/${friendshipId}` : `/reject/${friendshipId}`;
		const method = accept ? 'POST' : 'DELETE';
		
		const res = await apiCall(endpoint, method);
		if (res) {
			setMsg({ type: 'success', text: accept ? 'Friend added!' : 'Request ignored.' });
			refreshData();
		}
	};

	const inviteToGame = (e: React.MouseEvent, friend: UserProfile) => {
		e.stopPropagation();
		// maybe `game-selector:${friend.id}` later
		openWindow('game-selector', { friendId: friend.id, username: friend.username });
	};

	// --- Render Helpers ---
	const TabButton = ({ id, label }: { id: typeof activeTab, label: string }) => (
		<button 
			onClick={() => { setActiveTab(id); setMsg(null); }}
			className={`tab-button ${activeTab === id ? 'active' : ''}`}
		>
			{label}
		</button>
	);

	return (
		<div className="friends-container">
			<div className="friends-tabs">
				<TabButton id="friends" label="Friends" />
				<TabButton id="requests" label={`Requests ${requests.length > 0 ? `(${requests.length})` : ''}`} />
				<TabButton id="add" label="Add" />
			</div>

			{msg && (
				<div className={`friends-msg ${msg.type}`}>
					{msg.text}
				</div>
			)}

			<div className="friends-content">
				{loading && <div className="loading-text">Loading...</div>}

				{/* Friends List */}
				{activeTab === 'friends' && !loading && (
					<ul className="friends-list">
						{friends.length === 0 ? <p className="empty-text">No friends yet.</p> : null}
						{friends.map(friend => (
							<li key={friend.id} className="friend-item">
								<div className="friend-info">
									<span className="friend-name">{friend.username}</span>
									<span className="friend-email">{friend.email}</span>
								</div>
								<button 
									onClick={(e) => inviteToGame(e, friend)}
									className="action-btn"
								>
									Invite to game
								</button>
								{/* <button
									onClick={() => openWindow(`chat-${friend.id}`, { friendId: friend.id, username: friend.username })}
									className="chat-button"
								>
									Chat
								</button> */}
							</li>
						))}
					</ul>
				)}

				{/* Requests List */}
				{activeTab === 'requests' && !loading && (
					<ul className="requests-list">
						{requests.length === 0 ? <p className="empty-text">No pending requests.</p> : null}
						{requests.map(req => (
							<li key={req.id} className="request-item">
								<div className="request-text">
									<span className="request-sender">{req.sender}</span> wants to be friends.
								</div>
								<div className="request-actions">
									<button 
										onClick={() => respondToRequest(req.id, true)}
										className="action-btn accept"
									>
										Accept
									</button>
									<button 
										onClick={() => respondToRequest(req.id, false)}
										className="action-btn decline"
									>
										Decline
									</button>
								</div>
							</li>
						))}
					</ul>
				)}

				{/* Add Friend Form */}
				{activeTab === 'add' && (
					<div className="mt-2">
						<form onSubmit={sendRequest} className="add-friend-form">
							<label className="form-label">Friend's Email:</label>
							<input 
								type="email" 
								value={targetEmail}
								onChange={(e) => setTargetEmail(e.target.value)}
								placeholder="name@example.com"
								className="form-input"
								required
							/>
							<button 
								type="submit" 
								disabled={!targetEmail}
								className="submit-btn"
							>
								Send Request
							</button>
						</form>
					</div>
				)}
			</div>
		</div>
	);
};

export default FriendsList;