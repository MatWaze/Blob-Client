import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

export interface GameInvite
{
    roomId:		string;
    senderName:	string;
}

export interface Notification
{
    id: string;
    type: 'info' | 'success' | 'error' | 'game-invite';
    title: string;
    message: string;
    data?: any;
    duration?: number;
}

interface NotificationContextType
{
    notifications: Notification[];
    addNotification: (note: Omit<Notification, 'id'>) => void;
    removeNotification: (id: string) => void;
    acceptGameInvite: (roomId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () =>
{
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within a NotificationProvider');
    return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) =>
{
    const MAX_VISIBLE_NOTIFICATIONS = 5;
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { user } = useAuth();
    const { socket, isConnected } = useSocket();

    useEffect(() =>
    {
        if (!user || !socket || !isConnected) return;

        socket.send(JSON.stringify({ type: "SUBSCRIBE_PRIVATE" }));

        const handleMessage = (event: MessageEvent) =>
        {
            try
            {
                const data: GameInvite | undefined = JSON.parse(event.data);
                if (data && "senderName" in data)
                {
                    addNotification
                    ({
                        type: 'game-invite',
                        title: 'Game Invite',
                        message: `${data.senderName} invited you to play!`,
                        data: { roomId: data.roomId },
                        duration: 10000
                    });
                }
            }
            catch (e) { console.error('Notification WS Error:', e); }
        };

        socket.addEventListener('message', handleMessage);
        
        return () =>
        {
            socket.removeEventListener('message', handleMessage);
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: "UNSUBSCRIBE_PRIVATE" }));
            }
        };
    }, [user, socket, isConnected]);

    const addNotification = useCallback((note: Omit<Notification, 'id'>) =>
    {
        const id = Math.random().toString(36).substr(2, 9);
        setNotifications(prev => {
            const next = [...prev, { ...note, id }];
            return next.length > MAX_VISIBLE_NOTIFICATIONS
                ? next.slice(next.length - MAX_VISIBLE_NOTIFICATIONS)
                : next;
        });

        if (note.duration)
            setTimeout(() => removeNotification(id), note.duration);
    }, []);

    const removeNotification = useCallback((id: string) =>
    {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const acceptGameInvite = useCallback((roomId: string) =>
    {
        if (socket && isConnected) {
            socket.send(JSON.stringify({ type: 'JOIN_ROOM', roomId }));
            
            window.dispatchEvent(new Event('RESET_GAME_VIEW'));

            // Clean up the invite notification immediately
            setNotifications(prev => prev.filter(n => !(n.type === 'game-invite' && n.data?.roomId === roomId)));
        }
    }, [socket, isConnected]);

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, acceptGameInvite }}>
            {children}
        </NotificationContext.Provider>
    );
};