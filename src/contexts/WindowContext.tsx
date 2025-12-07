import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type WindowType = 'login' | 'register' | 'game' | 'profile';

interface WindowState {
    id: WindowType;
    isOpen: boolean;
    isMaximized: boolean;
    zIndex: number;
    position?: { x: number; y: number };
    size?: { width: number; height: number };
}

interface WindowContextType {
    windows: Record<WindowType, WindowState>;
    openWindow: (type: WindowType) => void;
    closeWindow: (type: WindowType) => void;
    focusWindow: (type: WindowType) => void;
    toggleMaximize: (type: WindowType) => void;
    activeWindows: WindowType[];
    closeAll: () => void;
}

const WindowContext = createContext<WindowContextType | undefined>(undefined);

export const WindowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [windows, setWindows] = useState<Record<WindowType, WindowState>>({
        login: { id: 'login', isOpen: false, isMaximized: false, zIndex: 100 },
        register: { id: 'register', isOpen: false, isMaximized: false, zIndex: 100 },
        game: { id: 'game', isOpen: false, isMaximized: false, zIndex: 100 },
        profile: { id: 'profile', isOpen: false, isMaximized: false, zIndex: 100 },
    });
    
    const [activeWindows, setActiveWindows] = useState<WindowType[]>([]);
    const [nextZIndex, setNextZIndex] = useState(200);

    const openWindow = (type: WindowType) => {
        setWindows(prev => ({
            ...prev,
            [type]: { ...prev[type], isOpen: true, zIndex: nextZIndex }
        }));
        setNextZIndex(prev => prev + 1);
        
        if (!activeWindows.includes(type)) {
            setActiveWindows(prev => [...prev, type]);
        }
    };

    const closeWindow = (type: WindowType) => {
        setWindows(prev => ({
            ...prev,
            [type]: { ...prev[type], isOpen: false, isMaximized: false }
        }));
        setActiveWindows(prev => prev.filter(w => w !== type));
    };

    const focusWindow = (type: WindowType) => {
        setWindows(prev => ({
            ...prev,
            [type]: { ...prev[type], zIndex: nextZIndex }
        }));
        setNextZIndex(prev => prev + 1);
    };

    const toggleMaximize = (type: WindowType) => {
        setWindows(prev => ({
            ...prev,
            [type]: { ...prev[type], isMaximized: !prev[type].isMaximized }
        }));
    };

    const closeAll = useCallback(() => {
        setWindows(prev => {
            const newWindows = { ...prev };
            Object.keys(newWindows).forEach(key => {
                newWindows[key as WindowType] = {
                    ...newWindows[key as WindowType],
                    isOpen: false,
                    isMaximized: false
                };
            });
            return newWindows;
        });
        setActiveWindows([]);
    }, []);

    return (
        <WindowContext.Provider value={{ windows, openWindow, closeWindow, focusWindow, toggleMaximize, activeWindows, closeAll }}>
            {children}
        </WindowContext.Provider>
    );
};

export const useWindow = () => {
    const context = useContext(WindowContext);
    if (context === undefined) {
        throw new Error('useWindow must be used within a WindowProvider');
    }
    return context;
};
