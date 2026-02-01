import React from 'react';
import SubWindow from './SubWindow';
import './StatisticsPanel.css';

const StatisticsPanel: React.FC = () => {
	const balance = 1250;
	const lastGames = [
		{ id: 1, opponent: 'Player123', result: 'win' as const, score: '11-7', date: '2026-01-30' },
		{ id: 2, opponent: 'GamerX', result: 'loss' as const, score: '9-11', date: '2026-01-29' },
		{ id: 3, opponent: 'PongMaster', result: 'win' as const, score: '11-5', date: '2026-01-28' },
	];

	return (
		<>
			<SubWindow title="Balance" width="calc(50% - 8px)">
				<div className="balance-display">
					<span className="balance-label">Current Balance</span>
					<span className="balance-amount">${balance.toLocaleString()}</span>
				</div>
			</SubWindow>

			<SubWindow title="Last Played Games" width="calc(50% - 8px)">
				<div className="games-list">
					{lastGames.map((game) => (
						<div key={game.id} className={`game-item ${game.result}`}>
							<span className="game-opponent">{game.opponent}</span>
							<span className="game-score">{game.score}</span>
							<span className={`game-result ${game.result}`}>
								{game.result.toUpperCase()}
							</span>
						</div>
					))}
				</div>
			</SubWindow>

			<SubWindow title="Overall Stats" width="100%">
				<div className="stats-grid">
					<div className="stat-item">
						<span className="stat-value">24</span>
						<span className="stat-label">Games Played</span>
					</div>
					<div className="stat-item">
						<span className="stat-value">18</span>
						<span className="stat-label">Wins</span>
					</div>
					<div className="stat-item">
						<span className="stat-value">6</span>
						<span className="stat-label">Losses</span>
					</div>
					<div className="stat-item">
						<span className="stat-value">75%</span>
						<span className="stat-label">Win Rate</span>
					</div>
				</div>
			</SubWindow>
		</>
	);
};

export default StatisticsPanel;