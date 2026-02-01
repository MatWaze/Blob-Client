import React from 'react';
import SubWindow from './SubWindow';
import { useWindow } from '../contexts/WindowContext';
import './FriendsPanel.css';

const FriendsPanel: React.FC = () => {
	const { openWindow } = useWindow(); // Try 'openWindow' instead of 'open'

	const handleOpenFriends = () => {
		openWindow('friends');
	};

	return (
		<>
			<SubWindow title="Online Friends" width="100%">
				<div className="friends-placeholder">
					<span className="placeholder-icon">👥</span>
					<p>Friends list coming soon!</p>
					<button className="open-friends-btn" onClick={handleOpenFriends}>
						Open Friends List
					</button>
				</div>
			</SubWindow>
		</>
	);
};

export default FriendsPanel;