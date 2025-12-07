import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

type Tab = 'info' | 'transactions' | 'games';

const Profile: React.FC = () => {
    const { user, checkSession } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('info');
    const [walletAddress, setWalletAddress] = useState(user?.walletAddress || '');
    const [transactions, setTransactions] = useState<any[]>([]);
    const [games, setGames] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const serverUrl = "http://localhost:4000";

    useEffect(() => {
        if (user) {
            setWalletAddress(user.walletAddress || '');
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'transactions') {
            loadTransactions();
        } else if (activeTab === 'games') {
            loadGames();
        }
    }, [activeTab]);

    const updateWallet = async () => {
        try {
            const response = await fetch(`${serverUrl}/api/users/wallet`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress }),
                credentials: 'include'
            });
            if (response.ok) {
                alert('Wallet updated');
                checkSession(); // Refresh user data
            } else {
                alert('Failed to update wallet');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const loadTransactions = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${serverUrl}/api/transactions`, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setTransactions(data.transactions || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadGames = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${serverUrl}/api/tournaments`, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setGames(data.tournaments || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div>Please login</div>;

    return (
        <div style={{ padding: '20px', color: 'var(--text-primary)', height: '100%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <div style={{ width: '100px', height: '100px', background: 'var(--bg-tertiary)', border: '2px solid var(--border-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>
                    👤
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>USERNAME</label>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{user.username}</div>
                    </div>
                    <div>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>EMAIL</label>
                        <div style={{ fontSize: '16px' }}>{user.email}</div>
                    </div>
                </div>
            </div>

            <div className="profile-tabs">
                <div className={`profile-tab ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>Info</div>
                <div className={`profile-tab ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => setActiveTab('transactions')}>Transactions</div>
                <div className={`profile-tab ${activeTab === 'games' ? 'active' : ''}`} onClick={() => setActiveTab('games')}>Recent Games</div>
            </div>

            {activeTab === 'info' && (
                <div className="profile-section active">
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>WALLET ADDRESS</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input 
                                type="text" 
                                value={walletAddress}
                                onChange={(e) => setWalletAddress(e.target.value)}
                                placeholder="0x..." 
                                style={{ flex: 1, background: 'var(--bg-tertiary)', border: '1px solid var(--border-secondary)', color: 'var(--text-primary)', padding: '8px', borderRadius: '4px' }} 
                            />
                            <button onClick={updateWallet} className="nav-btn">Update</button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'transactions' && (
                <div className="profile-section active">
                    {loading ? <div className="loading-state">Loading...</div> : (
                        <div className="transaction-list">
                            {transactions.length === 0 ? <div className="empty-state">No transactions</div> : transactions.map((tx, i) => (
                                <div key={i} className="transaction-item">
                                    <div className="transaction-header">
                                        <span>{tx.type}</span>
                                        <span className={`transaction-status status-${tx.status}`}>{tx.status}</span>
                                    </div>
                                    <div className="transaction-details">
                                        <div>Amount: {tx.amount}</div>
                                        <div>Date: {new Date(tx.createdAt).toLocaleString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'games' && (
                <div className="profile-section active">
                    {loading ? <div className="loading-state">Loading...</div> : (
                        <div className="game-list">
                            {games.length === 0 ? <div className="empty-state">No games</div> : games.map((game, i) => (
                                <div key={i} className="game-item">
                                    <div className="game-header">
                                        <span>{game.gameName || `Game #${game.id}`}</span>
                                    </div>
                                    <div className="game-details">
                                        <div>Placement: {game.placementName}</div>
                                        <div>Date: {new Date(game.createdAt).toLocaleString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Profile;
