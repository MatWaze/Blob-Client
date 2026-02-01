import React, { useState, useEffect } from 'react';
import './MainBox.css';

interface MainBoxProps {
	id: string;
	title: string;
	icon: React.ReactNode;
	color: string;
	children: React.ReactNode;
	onClose?: () => void;
	// New prop: changing this value forces the box to open
	triggerOpen?: number;
	// New prop: custom click handler when box is closed
	onClickWhenClosed?: () => void;
}

const MainBox: React.FC<MainBoxProps> = ({ title, icon, color, children, onClose, triggerOpen, onClickWhenClosed }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [isMaximized, setIsMaximized] = useState(false);

	// Watch for trigger signal to force open
	useEffect(() => {
		if (triggerOpen) {
			setIsOpen(true);
			// Optional: Auto-maximize on game start?
			// setIsMaximized(true); 
		}
	}, [triggerOpen]);

	const handleToggleOpen = () => {
		if (!isOpen) {
			// If there's a custom handler, call it instead of default open
			if (onClickWhenClosed) {
				onClickWhenClosed();
			} else {
				setIsOpen(true);
			}
		}
	};

	const handleMinimize = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsOpen(false);
		setIsMaximized(false);
		if (onClose) onClose();
	};

	// Collapse without calling onClose - just go back to showing icon/title
	const handleCollapse = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsOpen(false);
		setIsMaximized(false);
	};

	const handleMaximize = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsMaximized(!isMaximized);
	};

	return (
		<div 
			className={`main-box ${isOpen ? 'open' : ''} ${isMaximized ? 'maximized' : ''}`}
			onClick={!isOpen ? handleToggleOpen : undefined}
			style={{ '--box-color': color } as React.CSSProperties}
		>
			{!isOpen ? (
				<div className="main-box-collapsed">
					<div className="main-box-icon">{icon}</div>
					<div className="main-box-title">{title}</div>
				</div>
			) : (
				<>
					{!isMaximized && (
						<>
							<button className="corner-btn top-left" onClick={onClose ? handleMinimize : handleCollapse} title="Collapse">✕</button>
							<button className="corner-btn top-right" onClick={handleMaximize} title="Maximize">□</button>
						</>
					)}

					<div className="main-box-content">
						{children}
					</div>

					{isMaximized && (
						<button 
							className="corner-btn bottom-left"
							onClick={handleMaximize}
							title="Restore"
						>
							↙
						</button>
					)}
				</>
			)}
		</div>
	);
};

export default MainBox;