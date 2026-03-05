import React, { useState, useEffect } from 'react';
import './MainBox.css';

const hashString = (value: string): number => {
	let h = 2166136261;
	for (let i = 0; i < value.length; i++) {
		h ^= value.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
};

const mulberry32 = (seed: number) => {
	let t = seed >>> 0;
	return () => {
		t += 0x6D2B79F5;
		let r = Math.imul(t ^ (t >>> 15), t | 1);
		r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
		return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
	};
};

type BlobConfig = {
	width: number;
	height: number;
	left: number;
	top: number;
	opacity: number;
	colorMix: number;  // 0-100: percentage of box-color vs white
	morphDuration: number;
	moveDuration: number;
	morphDelay: number;
	moveDelay: number;
	moveTwo: boolean;
};

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

const MainBox: React.FC<MainBoxProps> = ({ id, title, icon, color, children, onClose, triggerOpen, onClickWhenClosed }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [isMaximized, setIsMaximized] = useState(false);

	const blobLayout = React.useMemo<BlobConfig[]>(() => {
		const seed = hashString(id);
		const rand = mulberry32(seed);

		const base = 270; // fixed base size, blur hides exact edges

		// Spread blobs across zones so they don't clump together
		const zones = [
			{ cx: 7,  cy: 10 },  // top-left
			{ cx: 40, cy: 5  },  // top-center
			{ cx: 80, cy: 14 },  // top-right
			{ cx: 4,  cy: 52 },  // mid-left
			{ cx: 70, cy: 48 },  // mid-right
			{ cx: 10, cy: 82 },  // bottom-left
			{ cx: 70, cy: 80 },  // bottom-right
		];

		return Array.from({ length: 5 }, (_, idx) => {
			const w = Math.round(base * (0.55 + rand() * 1.1));
			const h = Math.round(w * (0.65 + rand() * 0.6));
			const zone = zones[idx];
			const jitter = 14;
			return {
				width: w,
				height: h,
				left: zone.cx + (rand() - 0.5) * jitter * 2,
				top: zone.cy + (rand() - 0.5) * jitter * 2,
				opacity: 0.3 + rand() * 0.55,
				colorMix: 30 + Math.round(rand() * 60),  // 30-90% box-color
				morphDuration: 5 + rand() * 14,
				moveDuration: 8 + rand() * 18,
				morphDelay: -(rand() * 8),
				moveDelay: -(rand() * 10),
				moveTwo: idx % 2 === 1,
			};
		});
	}, [id]);

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
			className={`main-box${isOpen ? ' open' : ''}${isMaximized ? ' maximized' : ''}`}
			id={`main-${id}`}
			onClick={!isOpen ? handleToggleOpen : undefined}
			style={{ '--box-color': color } as React.CSSProperties}
		>
			{!isOpen ? (
				<div className="main-box-collapsed">
					<div className="blob-c" aria-hidden="true">
						{blobLayout.map((blob, index) => (
							<div
								key={`${id}-blob-${index}`}
								className={`shape-blob${blob.moveTwo ? ' move-two' : ''}`}
								style={{
									'--blob-w': `${blob.width}px`,
									'--blob-h': `${blob.height}px`,
									'--blob-left': `${blob.left}%`,
									'--blob-top': `${blob.top}%`,
									'--blob-opacity': `${blob.opacity}`,								'--blob-color-mix': `${blob.colorMix}%`,									'--blob-morph-duration': `${blob.morphDuration}s`,
									'--blob-move-duration': `${blob.moveDuration}s`,
									'--blob-morph-delay': `${blob.morphDelay}s`,
									'--blob-move-delay': `${blob.moveDelay}s`,
								} as React.CSSProperties}
							></div>
						))}
					</div>
					{icon}
					<div className={`main-box-title-${title.toLowerCase()}`} data-title={title}>{title}</div>
				</div>
			) : (
				<>
					{!isMaximized && (
						<>
							<button className="corner-btn bottom-left close-corner" onClick={onClose ? handleMinimize : handleCollapse} title="Collapse">✕</button>
							<button className="corner-btn top-right maximize-corner" onClick={handleMaximize} title="Maximize" aria-label="Maximize"></button>
						</>
					)}

					<div className="main-box-content" id={`main-content-${id}`}>
						{children}
					</div>

					{isMaximized && (
						<button 
							className="corner-btn bottom-left restore-corner"
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