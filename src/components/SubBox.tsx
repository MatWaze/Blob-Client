import React, { useState, useEffect } from 'react';
import './SubBox.css';

interface SubBoxProps {
	title: string;
	icon: React.ReactNode;
	color: string;
	children?: React.ReactNode;
	embeddedContent?: React.ReactNode;
	defaultMaximized?: boolean;
	triggerOpen?: number;
	// New prop to force close
	triggerClose?: number;
	isOpen?: boolean; // Add this prop
	onOpenChange?: (open: boolean) => void; // Optional: callback for state changes
}

const SUB_BLOB_SHAPES = [
	"40% 60% 70% 30% / 40% 40% 60% 50%",
	"60% 40% 30% 70% / 50% 30% 70% 50%",
	"50% 50% 50% 50% / 40% 60% 40% 60%",
	"70% 30% 40% 60% / 60% 40% 60% 40%"
];

const SubBox: React.FC<SubBoxProps> = ({
	title, 
	icon, 
	color, 
	children, 
	embeddedContent,
	defaultMaximized = false,
	triggerOpen,
	triggerClose,
	isOpen: controlledIsOpen,
	onOpenChange
}) => {
	const [internalOpen, setInternalOpen] = useState(false);
	const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;

	// Use this to update internal state if controlled externally
	useEffect(() => {
		if (controlledIsOpen !== undefined) setInternalOpen(controlledIsOpen);
	}, [controlledIsOpen]);

	const handleOpen = () => {
		if (!isOpen) {
			if (onOpenChange) onOpenChange(true);
			setInternalOpen(true);
		}
	};

	const handleClose = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onOpenChange) onOpenChange(false);
		setInternalOpen(false);
	};

	const handleMaximize = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsMaximized(!isMaximized);
	};

	const [isMaximized, setIsMaximized] = useState(false);

	const showContent = embeddedContent || children;

	const [blobShape, setBlobShape] = useState(SUB_BLOB_SHAPES[0]);

	useEffect(() => {
        if (isOpen || isMaximized) return;

        const interval = setInterval(() => {
            setBlobShape(prev => {
                const available = SUB_BLOB_SHAPES.filter(s => s !== prev);
                return available[Math.floor(Math.random() * available.length)];
            });
        }, 4000); // Slightly slower for sub-boxes

        return () => clearInterval(interval);
    }, [isOpen, isMaximized]);

	// Watch for trigger signal to force open
	useEffect(() => {
		if (triggerOpen) {
			setInternalOpen(true);
			setIsMaximized(true);
		}
	}, [triggerOpen]);

	// Watch for trigger signal to force close
	useEffect(() => {
		if (triggerClose) {
			setInternalOpen(false);
			setIsMaximized(false);
		}
	}, [triggerClose]);

	return (
		<div 
			className={`sub-box${isOpen ? ' open' : ''}${isMaximized ? ' maximized' : ''}`}
			style={{ 
                '--sub-color': color,
                // Snap to rectangle when open/maximized, otherwise breathe
                borderRadius: (isOpen || isMaximized) ? '12px' : blobShape 
            } as React.CSSProperties}
			onClick={!isOpen ? handleOpen : undefined}
		>
			{!isOpen ? (
				<div className="sub-box-collapsed" style={{ cursor: 'pointer' }}>
						<div className="sub-box-icon">{icon}</div>
						<div className="sub-box-title">{title}</div>
				</div>
			) : (
				<>
						<button 
								className="sub-corner-btn top-left"
								onMouseDown={handleClose}
								title="Close"
								style={{
										clipPath: 'polygon(0 0, 100% 0, 0 100%)',
										justifyContent: 'flex-start',
										alignItems: 'flex-start',
										paddingTop: '4px',
										paddingLeft: '4px',
										left: 0,
										right: 'auto',
										zIndex: 102
								}}
						>
								✕
						</button>

						{!defaultMaximized && (
								<>
										{!isMaximized ? (
												<button 
														className="sub-corner-btn top-right"
														onMouseDown={handleMaximize}
														title="Maximize"
												>
														□
												</button>
										) : (
												<button 
														className="sub-corner-btn top-right"
														onMouseDown={handleMaximize}
														title="Restore"
														style={{ zIndex: 101 }}
												>
														↙
												</button>
										)}
								</>
						)}

						<div className="sub-box-content">
								<div className="sub-inner-scroll">
										{showContent}
								</div>
						</div>
				</>
			)}
		</div>
	);
};

export default SubBox;