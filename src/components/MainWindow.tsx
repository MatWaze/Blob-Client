import React, { useState, ReactNode } from 'react';
import './MainWindow.css';

interface MainWindowProps {
	id: string;
	title: string;
	children: ReactNode;
	onClose?: () => void;
}

const MainWindow: React.FC<MainWindowProps> = ({ 
	id,
	title, 
	children, 
	onClose 
}) => {
	const [isMaximized, setIsMaximized] = useState(false);
	const [isVisible, setIsVisible] = useState(true);

	if (!isVisible) return null;

	const handleClose = () => {
		setIsVisible(false);
		onClose?.();
	};

	return (
		<div className={`main-window ${isMaximized ? 'maximized' : ''}`} data-id={id}>
			<div className="main-window-header">
				<button 
					className="main-window-btn minimize-btn"
					onClick={() => setIsMaximized(!isMaximized)}
					title={isMaximized ? 'Minimize' : 'Maximize'}
				>
					{isMaximized ? '▼' : '▲'}
				</button>
				<span className="main-window-title">{title}</span>
			</div>
			<div className="main-window-content">
				{children}
			</div>
			{!isMaximized && (
				<button 
					className="main-window-btn close-btn"
					onClick={handleClose}
					title="Close"
				>
					✕
				</button>
			)}
		</div>
	);
};

export default MainWindow;