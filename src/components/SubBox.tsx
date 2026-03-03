import React, { useState, useEffect, useMemo } from 'react';
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
    "40% 60% 70% 30% / 40% 50% 60% 50%", 
    "50% 50% 30% 70% / 50% 50% 70% 30%", 
    "70% 30% 50% 50% / 30% 30% 70% 70%", 
    "30% 70% 70% 30% / 50% 70% 30% 50%", 
    "60% 40% 40% 60% / 70% 30% 70% 30%",
    "45% 55% 35% 65% / 55% 45% 60% 40%"
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
	const motionSeed = useMemo(() => {
		const morphDurationSec = 8 + Math.random() * 6;
		const driftDurationSec = 45 + Math.random() * 30;
		return {
			initialShape: SUB_BLOB_SHAPES[Math.floor(Math.random() * SUB_BLOB_SHAPES.length)],
			shapeIntervalMs: 3200 + Math.floor(Math.random() * 2600),
			shapeStartDelayMs: Math.floor(Math.random() * 2200),
			morphDurationSec,
			morphDelaySec: -(Math.random() * morphDurationSec),
			driftDurationSec,
			driftDelaySec: -(Math.random() * driftDurationSec),
		};
	}, []);

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

	const [blobShape, setBlobShape] = useState(motionSeed.initialShape);

	useEffect(() => {
		if (isOpen || isMaximized) return;

		let interval: ReturnType<typeof setInterval> | undefined;
		const starter = setTimeout(() => {
			interval = setInterval(() => {
				setBlobShape(prev => {
					const available = SUB_BLOB_SHAPES.filter(s => s !== prev);
					return available[Math.floor(Math.random() * available.length)];
				});
			}, motionSeed.shapeIntervalMs);
		}, motionSeed.shapeStartDelayMs);

		return () => {
			clearTimeout(starter);
			if (interval) clearInterval(interval);
		};
	}, [isOpen, isMaximized, motionSeed]);

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

	const subBoxStyle = {
		'--sub-color': color,
		'--blob-morph-duration': `${motionSeed.morphDurationSec}s`,
		'--blob-morph-delay': `${motionSeed.morphDelaySec}s`,
		'--blob-drift-duration': `${motionSeed.driftDurationSec}s`,
		'--blob-drift-delay': `${motionSeed.driftDelaySec}s`,
		// Snap to rectangle when open/maximized, otherwise breathe
		borderRadius: (isOpen || isMaximized) ? '12px' : blobShape
	} as React.CSSProperties;

	return (
		<div 
			className={`sub-box${isOpen ? ' open' : ''}${isMaximized ? ' maximized' : ''}`}
			style={subBoxStyle}
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