import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWindow } from '../contexts/WindowContext';
import { useSocket } from '../contexts/SocketContext';
import './GameSelector.css';

interface GameSelectorProps {
    friendId: string;
    username: string;
}

interface Room {
    id: string;
    name: string;
    entryFee: number;
    maxPlayers: number;
    state: string;
}

const GameSelector: React.FC<GameSelectorProps> = ({ friendId, username }) => {
    const { user } = useAuth();
    const { closeWindow } = useWindow();
    const { socket, isConnected } = useSocket();
    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);
    const [sent, setSent] = useState(false);

    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleMessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                // Assuming data is the room object
                if (data && data.id) {
                    setRoom(data);
                    setLoading(false);
                }
            } catch (e) {
                console.error(e);
            }
        };

        socket.addEventListener('message', handleMessage);
        
        // Request room info
        socket.send(JSON.stringify({ type: 'GET_ROOM_FOR_USER' }));

        // Set a timeout to stop loading if no room is found
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
            setTimeout(() => closeWindow('game-selector'), 2000);
        }
    };

    if (loading) return <div className="game-selector-loading">Loading games...</div>;

    if (sent) return <div className="game-selector-success">Invite sent to {username}!</div>;

    if (!room) return (
        <div className="game-selector-empty">
            <p>You are not currently in a game room.</p>
            <p>Create a game first to invite friends!</p>
            {/* <button onClick={() => closeWindow('game-selector')}>Close</button> */}
        </div>
    );

    return (
        <div className="game-selector">
            <div className="game-selector-header">
                Invite <span>{username}</span> to:
            </div>
            <div className="room-card">
                <div className="room-info">
                    <div className="room-name">{room.name}</div>
                    <div className="room-details">
                        <span>Fee: {room.entryFee}</span>
                        <span>Players: {room.maxPlayers}</span>
                    </div>
                </div>
                <button className="invite-btn" onClick={handleInvite}>
                    Invite
                </button>
            </div>
        </div>
    );
};

export default GameSelector;
