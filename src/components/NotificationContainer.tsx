import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import './NotificationContainer.css';

const NotificationContainer: React.FC = () => {
	const { notifications, removeNotification, acceptGameInvite } = useNotification();

	// Game invites are shown inside the Invitations SubBox, not as popups
	const popupNotifications = notifications.filter(n => n.type !== 'game-invite');

	if (popupNotifications.length === 0) return null;

	return (
		<div className="notification-container">
			{popupNotifications.map(note => (
				<div key={note.id} className={`notification-toast ${note.type}`}>
					<div className="notification-header">
						<strong className="notification-title">{note.title}</strong>
						<button 
							className="notification-close-btn" 
							onClick={() => removeNotification(note.id)}
							aria-label="Close notification"
						>
							&times;
						</button>
					</div>
					<div className="notification-body">
						{note.message}
					</div>
					
					{/* Special Actions for Game Invites */}
					{note.type === 'game-invite' && (
						<div className="notification-actions">
							<button 
								className="accept-btn"
								onClick={() => {
									acceptGameInvite(note.data.roomId);
									removeNotification(note.id);
								}}
							>
								Accept
							</button>
							<button
								className="decline-btn"
								onClick={() => removeNotification(note.id)}
							>
								Decline
							</button>
						</div>
					)}
				</div>
			))}
		</div>
	);
};

export default NotificationContainer;