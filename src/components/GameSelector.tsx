import React, { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import './GameSelector.css';

interface GameSelectorProps {
    friendId: string;
    username: string;
    onClose: () => void;
}

interface Room {
    id: string;
    name: string;
    entryFee: number;
    maxPlayers: number;
    state: string;
}

const GameSelector: React.FC<GameSelectorProps> = ({ friendId, username, onClose }) => {
    const { socket, isConnected } = useSocket();
    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);
    const [sent, setSent] = useState(false);

    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleMessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                // "GET_ROOM_FOR_USER" returns the room object if user is in one
                if (data && data.id) {
                    setRoom(data);
                    setLoading(false);
                }
            } catch (e) {
                console.error(e);
            }
        };

        socket.addEventListener('message', handleMessage);
        
        // Check if I am currently in a room
        socket.send(JSON.stringify({ type: 'GET_ROOM_FOR_USER' }));

        const timeout = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => {
            socket.removeEventListener('message', handleMessage);
            clearTimeout(timeout);
        };
    }, [socket, isConnected]);

    const handleInvite = () => {
        if (socket && room) {
            socket.send(JSON.stringify({
                type: 'GAME_INVITE',
                target: username,
                targetId: friendId,
                roomId: room.id
            }));
            setSent(true);
            setTimeout(() => onClose(), 2000);
        }
    };

    if (loading) return <div className="game-selector-loading">Checking room status...</div>;

    if (sent) return <div className="game-selector-success">Invite sent to {username}!</div>;

    if (!room) return (
        <div className="game-selector-empty">
            <p>You must be in a game lobby to invite someone.</p>
            <p className="hint">Go to Games &gt; Pong &gt; Create/Join first.</p>
            <button className="invite-btn" onClick={onClose} style={{marginTop: 15, background: '#555'}}>Back</button>
        </div>
    );

    return (
        <div className="game-selector">
            <div className="game-selector-header">
                Invite <span>{username}</span>?
            </div>
            <div className="room-card">
                <div className="room-info">
                    <div className="room-name">{room.name}</div>
                    <div className="room-details">
                        <span>To your current lobby</span>
                    </div>
                </div>
                <div style={{display: 'flex', gap: 10, marginTop: 10}}>
                    <button className="invite-btn" onClick={handleInvite}>
                        Send Invite
                    </button>
                    <button className="invite-btn" onClick={onClose} style={{background: '#444'}}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameSelector;
