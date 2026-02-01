import React from 'react';
import SubWindow from './SubWindow';
import { useWindow } from '../contexts/WindowContext';
import './GamesPanel.css';

const GamesPanel: React.FC = () => {
	const { openWindow } = useWindow(); // Try 'openWindow' instead of 'open'

	const handlePlayPong = () => {
		openWindow('game');
	};

	return (
		<>
			<SubWindow title="Pong" width="calc(50% - 8px)">
				<div className="game-card">
					<div className="game-icon">🏓</div>
					<div className="game-info">
						<h3>Classic Pong</h3>
						<p>Play the classic arcade game against other players</p>
						<div className="game-stats">
							<span>🎮 Online: 42</span>
							<span>⏱️ Avg: 5 min</span>
						</div>
					</div>
					<button className="play-btn" onClick={handlePlayPong}>
						Play Now
					</button>
				</div>
			</SubWindow>

			<SubWindow title="Coming Soon" width="calc(50% - 8px)">
				<div className="game-card coming-soon">
					<div className="game-icon">🎮</div>
					<div className="game-info">
						<h3>More Games</h3>
						<p>New games will be added soon!</p>
					</div>
					<button className="play-btn" disabled>
						Coming Soon
					</button>
				</div>
			</SubWindow>

			<SubWindow title="Quick Match" width="100%">
				<div className="quick-match">
					<p>Jump into a random game instantly!</p>
					<button className="quick-match-btn" onClick={handlePlayPong}>
						🎲 Find Match
					</button>
				</div>
			</SubWindow>
		</>
	);
};

export default GamesPanel;