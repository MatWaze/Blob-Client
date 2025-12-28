import React, { ReactNode, useRef } from 'react';
import Draggable from 'react-draggable';
import { useWindow, WindowType } from '../contexts/WindowContext';

interface WindowProps {
    type: WindowType;
    title: string;
    children: ReactNode;
    icon?: string;
}

const Window: React.FC<WindowProps> = ({ type, title, children, icon }) => {
    const { windows, closeWindow, focusWindow, toggleMaximize } = useWindow();
    const windowState = windows[type];
    const nodeRef = useRef<HTMLDivElement>(null);
    
    const [isDragging, setIsDragging] = React.useState(false);
    const [size, setSize] = React.useState({ width: 400, height: 300 }); // Default size
    const [isResizing, setIsResizing] = React.useState(false);
    const isResizingRef = useRef(false);
    const [position, setPosition] = React.useState(windowState.position || { x: 50, y: 50 });

    // Reset position when maximized
    React.useEffect(() => {
        if (windowState.isMaximized) {
            setPosition({ x: 0, y: 0 });
        }
    }, [windowState.isMaximized]);

    if (!windowState.isOpen) return null;

    const handleMouseDown = () => {
        focusWindow(type);
    };

    const windowClass = `window active ${windowState.isMaximized ? 'maximized' : ''}`;

    // If maximized, we disable dragging
    const isDraggable = !windowState.isMaximized;

    const handleDragStart = () => {
        handleMouseDown();
        setIsDragging(true);
    };

    const handleDragStop = () => {
        setIsDragging(false);
    };

    const handleResizePointerDown = (e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        isResizingRef.current = true;
        setIsResizing(true);
        
        const target = e.currentTarget;
        target.setPointerCapture(e.pointerId);
        
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = nodeRef.current?.offsetWidth || size.width;
        const startHeight = nodeRef.current?.offsetHeight || size.height;

        const handlePointerMove = (moveEvent: PointerEvent) => {
            if (!isResizingRef.current) return;
            
            // Get parent dimensions
            const parent = nodeRef.current?.parentElement;
            const parentWidth = parent?.clientWidth || window.innerWidth;
            const parentHeight = parent?.clientHeight || window.innerHeight;

            // Calculate new dimensions
            let newWidth = Math.max(300, startWidth + (moveEvent.clientX - startX));
            let newHeight = Math.max(200, startHeight + (moveEvent.clientY - startY));
            
            // Constrain to parent bounds
            if (position.x + newWidth > parentWidth) {
                newWidth = parentWidth - position.x;
            }
            if (position.y + newHeight > parentHeight) {
                newHeight = parentHeight - position.y;
            }

            setSize({ width: newWidth, height: newHeight });
        };

        const handlePointerUp = (upEvent: PointerEvent) => {
            isResizingRef.current = false;
            setIsResizing(false);
            target.releasePointerCapture(upEvent.pointerId);
            target.removeEventListener('pointermove', handlePointerMove as any);
            target.removeEventListener('pointerup', handlePointerUp as any);
        };

        target.addEventListener('pointermove', handlePointerMove as any);
        target.addEventListener('pointerup', handlePointerUp as any);
    };

    const handleDrag = (e: any, data: any) => {
        setPosition({ x: data.x, y: data.y });
    };

    return (
        <Draggable
            handle=".window-header"
            nodeRef={nodeRef}
            disabled={!isDraggable || isResizing}
            onStart={handleDragStart}
            onDrag={handleDrag}
            onStop={handleDragStop}
            bounds="parent"
            position={position}
        >
            <div 
                ref={nodeRef}
                className={windowClass}
                style={{ 
                    zIndex: windowState.zIndex,
                    width: windowState.isMaximized ? '100%' : size.width,
                    height: windowState.isMaximized ? '100%' : size.height,
                    // pointerEvents: isDragging ? 'none' : 'auto' // Removed this as it might block interaction with the window itself
                }}
                onMouseDown={handleMouseDown}
            >
                {/* Overlay to capture events over iframes during drag */}
                {(isDragging || isResizing) && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 9999, // show window on top of others
                        cursor: isDragging ? 'move' : 'nwse-resize'
                    }} />
                )}
                <div className="window-header">
                    <div className="window-title">
                        {icon && <span style={{ marginRight: '8px' }}>{icon}</span>}
                        {title}
                    </div>
                    <div className="window-controls">
                        <div 
                            className="window-control maximize" 
                            title="Maximize" 
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => { e.stopPropagation(); toggleMaximize(type); }}
                        ></div>
                        <div 
                            className="window-control close" 
                            title="Close" 
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => { e.stopPropagation(); closeWindow(type); }}
                        ></div>
                    </div>
                </div>
                <div className="window-content">
                    {children}
                </div>
                {!windowState.isMaximized && (
                    <div 
                        className="resize-handle"
                        onPointerDown={handleResizePointerDown}
                    ></div>
                )}
            </div>
        </Draggable>
    );
};

export default Window;
