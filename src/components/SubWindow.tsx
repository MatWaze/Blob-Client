import React, { ReactNode } from 'react';
import './SubWindow.css';

interface SubWindowProps {
	title: string;
	children: ReactNode;
	width?: string;
}

const SubWindow: React.FC<SubWindowProps> = ({ title, children, width = '100%' }) => {
	return (
		<div className="sub-window" style={{ width }}>
		<div className="sub-window-header">
			<span className="sub-window-title">{title}</span>
		</div>
		<div className="sub-window-content">
			{children}
		</div>
		</div>
	);
};

export default SubWindow;