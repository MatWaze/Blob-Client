import React, { useState, useEffect, useCallback, useRef } from 'react';
import MainBox from './MainBox';
import SubBox from './SubBox';
import Game, { GameHandle } from './Game';
import Login from './Login';
import Register from './Register';
import ForgotPassword from './ForgotPassword'; // New Import
import ResetPassword from './ResetPassword';   // New Import
import GameSelector from './GameSelector'; // Import the new component
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
    CircularChart3DComponent, 
    CircularChart3DSeriesCollectionDirective, 
    CircularChart3DSeriesDirective, 
    Inject, 
    PieSeries3D, 
    CircularChartDataLabel3D, 
    CircularChartLegend3D, 
    CircularChartTooltip3D,
    Chart3DComponent,
    Chart3DSeriesCollectionDirective,
    Chart3DSeriesDirective,
    Legend3D,
    Category3D,
    Tooltip3D,
    ColumnSeries3D,
    Highlight3D
} from '@syncfusion/ej2-react-charts';
import ModelViewer from './ModelViewer';
import './Dashboard.css';

// --- Icons ---
const ProfileIcon = () => <span>🐱</span>;
const GamesIcon = () => <span>🎮</span>;
const CommunityIcon = () => <span>👥</span>;
const WalletIcon = () => <span>💰</span>;
const StatsIcon = () => <span>📊</span>;
const PongIcon = () => <span>🏓</span>;
const MafiaIcon = () => <span>🎭</span>;
const InfoIcon = () => <span>ℹ️</span>;
const LoginIcon = () => <span>🔑</span>;
const RegisterIcon = () => <span>📝</span>;

// --- Content Components ---

const WalletContent: React.FC = () => {
	const { user, fetchWithAuth, updateUser } = useAuth();
	const { theme } = useTheme();
	const [walletAddress, setWalletAddress] = useState(user?.walletAddress || '');
	const [withdrawAmount, setWithdrawAmount] = useState('');
	const [msg, setMsg] = useState<{type: 'success'|'error', text: string} | null>(null);
	const serverUrl = import.meta.env.VITE_SERVER_URL;

	const [savedAddress, setSavedAddress] = useState(user?.walletAddress || '');
	
	const [isSaving, setIsSaving] = useState(false);
	const [isWithdrawing, setIsWithdrawing] = useState(false);

	const [filter, setFilter] = useState('WEEK');
	const [chartData, setChartData] = useState([]);

	const chartRef = useRef<any>(null);      // Reference to the Chart
    const containerRef = useRef<HTMLDivElement>(null); // Reference to the Div wrapper

    // Watch for size changes and force chart refresh
    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            if (chartRef.current) {
                chartRef.current.refresh();
            }
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => resizeObserver.disconnect();
    }, []);

	// Auto-hide messages after 3 seconds
	useEffect(() => {
		if (msg) {
			const timer = setTimeout(() => setMsg(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [msg]);

	useEffect(() => {
		setWalletAddress(user?.walletAddress || '');
		setSavedAddress(user?.walletAddress || '');
	}, [user]);

	const refreshProfile = async () => {
		try {
			const res = await fetchWithAuth(`${serverUrl}/api/users/current/full`);
			if (res.ok) {
				const data = await res.json();
				if (data.success && data.user)
				{
					updateUser(data.user);
					setSavedAddress(data.user.walletAddress || '');
				}
			}
		} catch (e) { console.error(e); }
	};

	// Fetch current balance on mount
	useEffect(() => {
		refreshProfile();
	}, []);

	const fetchData = async () => {
		try {
			const res = await fetchWithAuth(`${serverUrl}/api/transactions/filtered`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ filter })
			});
			if (res.ok) {
				const data = await res.json();
				let transformed = data.transactions.map((item: any) => {
					let x: string;
					if (filter === 'WEEK') {
						x = new Date(item.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
					} else {
						const dateStr = item.month + '-01';
						x = new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
					}
					const y = item.total / 100; // cents to dollars
					return { x, y };
				});

				// For months views, show year only when it changes
				if (filter !== 'WEEK') {
					let currentYear = '';
					transformed.forEach((item: {x: string, y: number}, index: number) => {
						const date = new Date(data.transactions[index].month + '-01');
						const year = date.getFullYear().toString();
						const month = date.toLocaleDateString('en-US', { month: 'short' });
						if (year !== currentYear) {
							item.x = `${month} ${year}`;
							currentYear = year;
						} else {
							item.x = month;
						}
					});
				}

				setChartData(transformed);
			}
		} catch (e) { console.error(e); }
	};

	useEffect(() => { fetchData(); }, [filter]);

	const handleUpdateWallet = async () => {
		if (isSaving) return;

		setIsSaving(true);
		setMsg(null); 

		try {
			await new Promise(resolve => setTimeout(resolve, 500));

			const res = await fetchWithAuth(`${serverUrl}/api/users`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ walletAddress })
			});

			if (res.ok) {
				setMsg({ type: 'success', text: 'Wallet address updated!' });
				setSavedAddress(walletAddress);
				refreshProfile();
			} else {
				setMsg({ type: 'error', text: 'Failed to update wallet address' });
			}
		} catch (e) {
			setMsg({ type: 'error', text: 'Network error' });
		} finally {
			setIsSaving(false);
		}
	};

	const handleWithdraw = async () => {
		if (!withdrawAmount) return;
		if (isWithdrawing) return;
		
		setIsWithdrawing(true);
		setMsg(null);

		try {
			await new Promise(resolve => setTimeout(resolve, 500));

			const res = await fetchWithAuth(`${serverUrl}/api/transactions/withdraw`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ amount: Number(withdrawAmount) })
			});

			if (res.ok) {
				setMsg({ type: 'success', text: 'Withdrawal successful!' });
				setWithdrawAmount('');
				refreshProfile();
			} else {
				const data = await res.json();
				setMsg({ type: 'error', text: data.message || 'Withdrawal failed' });
			}
		} catch (error) {
			setMsg({ type: 'error', text: 'Network error' });
		} finally {
			setIsWithdrawing(false);
		}
	};

	const onChartLoad = (args: any) => {
		const chartEl = document.getElementById('withdrawal-chart');
		if (chartEl) chartEl.setAttribute('title', '');
	};

	const load = (args: any) => {
		args.chart.theme = 'MaterialDark';
	};

	// Check if address has changed from saved value
	const isAddressUnchanged = walletAddress === savedAddress;

	return (
		<div className="wallet-content">
			<div className="wallet-header-card">
				<h3>Balance</h3>
				<p className="balance">{(user?.balance ?? 0).toFixed(2)} BLOB</p>
				<span className="withdrawable">Withdrawable: {(user?.withdrawAmount ?? 0).toFixed(2)}</span>
			</div>

			<div className="wallet-actions">
				<div className="input-group">
					<label>Address</label>
					<div className="input-row">
						<input
							type="text"
							placeholder="0x..."
							value={walletAddress}
							onChange={e => setWalletAddress(e.target.value)}
							disabled={isSaving}
						/>
						<button 
							className="action-btn" 
							onClick={handleUpdateWallet}
							disabled={isAddressUnchanged || isSaving}
							style={{ 
								opacity: (isAddressUnchanged || isSaving) ? 0.5 : 1, 
								cursor: (isAddressUnchanged || isSaving) ? 'not-allowed' : 'pointer' 
							}}
						>
							{isSaving ? 'Updating...' : 'Update'}
						</button>
					</div>
				</div>

				<div className="input-group">
					<label>Withdraw</label>
					<div className="input-row">
						<input 
							type="number" 
							placeholder="0.00"
							value={withdrawAmount}
							onChange={(e) => {
								const val = e.target.value;
								// Regex: Allows integers, or decimals with up to 2 digits
								if (val === '' || /^\d+(\.\d{0,2})?$/.test(val)) {
									setWithdrawAmount(val);
								}
							}}
							disabled={isWithdrawing}
							step="0.01" // Helps some browsers show appropriate keyboard
							min="0"
						/>
						<button 
							className="action-btn withdraw" 
							onClick={handleWithdraw}
							disabled={isWithdrawing || !withdrawAmount}
							style={{ 
								opacity: (isWithdrawing || !withdrawAmount) ? 0.5 : 1, 
								cursor: (isWithdrawing || !withdrawAmount) ? 'not-allowed' : 'pointer' 
							}}
						>
							{isWithdrawing ? '...' : 'Cash Out'}
						</button>
					</div>
				</div>
			</div>

			{msg && <div className={`error-box-${msg.type}`}>{msg.text}</div>}

			<div className="withdrawal-chart-section">
				<div className="filter-dropdown">
					<select style={{fontFamily: 'Courier New', fontSize: '16px'}} value={filter} onChange={(e) => setFilter(e.target.value)}>
						<option value="WEEK">Week</option>
						<option value="3MONTHS">3 Months</option>
						<option value="YEAR">Year</option>
					</select>
				</div>
				<div className='control-pane'>
					<div className='control-section' ref={containerRef}>
						<Chart3DComponent
							ref={chartRef}
							id='withdrawal-chart'
							style={{ textAlign: "center" }}
							primaryXAxis={{ labelRotation: filter === 'YEAR' ? -34 : -13, labelIntersectAction: 'None', interval: 1, valueType: 'Category', labelPlacement: 'BetweenTicks', labelStyle: { color: theme === 'light' ? '#111827' : '#ffffff', fontFamily: 'Courier New' } }}
							wallColor='transparent'
							height="300"
							primaryYAxis={{ labelFormat: '{value} BLOB', labelStyle: { color: theme === 'light' ? '#111827' : '#ffffff', fontFamily: 'Courier New' } }}
							load={load}
							enableRotation={true}
							rotation={7}
							tilt={10}
							depth={100}
							tooltip={{ enable: true, header: "${point.x}", format: 'Amount: <b>${point.y}</b>', textStyle: { color: theme === 'light' ? '#111827' : '#ffffff', fontFamily: 'Courier New' } }}
							width="100%"
							title='Withdrawal History'
							titleStyle={{ color: theme === 'light' ? '#111827' : '#ffffff', fontFamily: 'Courier New' }}
							background="transparent"
							loaded={onChartLoad}
						>
							<Inject services={[ColumnSeries3D, Legend3D, Tooltip3D, Category3D, Highlight3D]}/>
							<Chart3DSeriesCollectionDirective>
								<Chart3DSeriesDirective
									dataSource={chartData}
									xName='x'
									columnSpacing={0.1}
									yName='y'
									type='Column'
									animation={{ enable: false }}
								>
								</Chart3DSeriesDirective>
							</Chart3DSeriesCollectionDirective>
						</Chart3DComponent>
					</div>
				</div>
			</div>
		</div>
	);
};

// --- Updated Stats Layout ---
// --- Updated Stats Layout with Pagination ---
const StatsContent: React.FC = () => {
    const { fetchWithAuth } = useAuth();
    const { theme } = useTheme();
    const [games, setGames] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const serverUrl = import.meta.env.VITE_SERVER_URL;

    // --- PAGINATION STATE ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3; // 4 looks best to avoid internal scrolling

    const pieChartRef = useRef<any>(null);
    const pieContainerRef = useRef<HTMLDivElement>(null);

    // --- Animation & Resize Logic (Preserved) ---
    const [enableAnimation, setEnableAnimation] = useState(true);

    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(() => {
                setEnableAnimation(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [loading]);

    useEffect(() => {
        if (loading) return;
        let resizeTimer: ReturnType<typeof setTimeout>;
        const resizeObserver = new ResizeObserver(() => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (pieChartRef.current) {
                    pieChartRef.current.refresh();
                }
            }, 200);
        });
        if (pieContainerRef.current) {
            resizeObserver.observe(pieContainerRef.current);
        }
        return () => {
            resizeObserver.disconnect();
            clearTimeout(resizeTimer);
        };
    }, [loading]);

    const onChartLoad = (args: any) => {
        const chartEl = document.getElementById('charts');
        if (chartEl) chartEl.setAttribute('title', '');
    };

    const load = (args: any) => {
        args.chart.theme = 'MaterialDark';
    };

    useEffect(() => {
        const loadGames = async () => {
            try {
                const response = await fetchWithAuth(`${serverUrl}/api/tournaments`);
                if (response.ok) {
                    const data = await response.json();
                    setGames(data.tournaments || []);
                }
            } catch (error) { console.error(error); } finally { setLoading(false); }
        };
        loadGames();
    }, [fetchWithAuth, serverUrl]);

    if (loading) return <div>Loading...</div>;

    // --- PAGINATION LOGIC ---
    const indexOfLastGame = currentPage * itemsPerPage;
    const indexOfFirstGame = indexOfLastGame - itemsPerPage;
    const currentGames = games.slice(indexOfFirstGame, indexOfLastGame);
    const totalPages = Math.ceil(games.length / itemsPerPage);

    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    // --- Chart Data Processing ---
    const earningsMap = games.reduce((acc, game) => {
        const name = game.gameName || 'Unknown Game';
        const score = parseFloat(game.score) || 0;
        acc[name] = (acc[name] || 0) + score;
        return acc;
    }, {} as Record<string, number>);

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

    type ChartItem = { x: string; y: number; text: string; fill: string };

    const rawChartData: ChartItem[] = Object.entries(earningsMap).map(([name, total], idx) => ({
        x: name,
        y: Number(total) || 0,
        text: `${name}: ${total}`,
        fill: COLORS[idx % COLORS.length],
    }));

    const totalEarnings = rawChartData.reduce((s, d) => s + d.y, 0);

    return (
        <div className="stats-content">
            {/* Game List with Pagination */}
            <div className="game-list">
                 {games.length === 0 ? (
                    <div className="empty-state">No games played recently</div>
                ) : (
                    <>
                        {currentGames.map((game, i) => (
                            <div key={i} className="game-item">
                                <div className="game-header">
                                    <span>{game.gameName || `Game #${game.id}`}</span>
                                    <div>Played at {new Date(game.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                </div>
                                <div className="game-details">
                                    <div>Place: <span className={game.placementName === 'Winner' || game.placementName === '1' ? 'text-won' : 'text-lost'}>{game.placementName}</span></div>
                                    <div>Fee: <span className="text-secondary">{game.fee} BLOB</span></div>
                                    <div>Score: <span className="text-secondary">{game.score} BLOB</span></div>
                                </div>
                            </div>
                        ))}

                        {/* Pagination Controls */}
                        {games.length > itemsPerPage && (
                            <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: 'auto', paddingTop: '10px', alignItems: 'center' }}>
                                <button 
                                    className="action-btn" 
                                    onClick={prevPage} 
                                    disabled={currentPage === 1}
                                    style={{ padding: '6px 12px', fontSize: '12px' }}
                                >
                                    Previous
                                </button>
                                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button 
                                    className="action-btn" 
                                    onClick={nextPage} 
                                    disabled={currentPage === totalPages}
                                    style={{ padding: '6px 12px', fontSize: '12px' }}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
            
            {/* Chart Section */}
            {(
                <div className="earnings-chart-container" ref={pieContainerRef}>
                    <div className="earnings-chart-canvas" style={{ background: 'transparent', border: '' }}>
                        {totalEarnings > 0 ? (
                            <CircularChart3DComponent 
                                ref={pieChartRef}
                                id='charts'  
                                style={{ textAlign: "center" }}
                                load={load}
                                loaded={onChartLoad}
                                titleStyle={{ 
                                    color: theme === 'light' ? '#111827' : '#ffffff',
                                    fontFamily: 'Courier New', 
                                }}
                                legendSettings={{ 
                                    visible: false,
                                    position: 'Bottom',
                                    textStyle: { 
                                        color: theme === 'light' ? '#000000' : '#ffffff',
                                        fontFamily: 'Courier New',
                                        fontWeight: 'bold',
                                    },
                                }}
                                tooltip={{ 
                                    enable: true, format: '${point.x} : ${point.y} BLOB', textStyle: { color: theme === 'light' ? '#111827' : '#ffffff', fontFamily: 'Courier New', } }}
                                rotation={15}
                                tilt={-15}
                                depth={30}
                                background="transparent"
                                enableRotation={true}
                                title="Earnings by game this week"
                            >
                                <Inject services={[PieSeries3D, CircularChartDataLabel3D, CircularChartLegend3D, CircularChartTooltip3D]} />
                                <CircularChart3DSeriesCollectionDirective>
                                    <CircularChart3DSeriesDirective 
                                        animation={{ enable: enableAnimation }}
                                        dataSource={rawChartData} 
                                        xName='x' 
                                        yName='y' 
                                        pointColorMapping="fill"
                                        radius='60%'
                                        dataLabel={{
                                            visible: true, 
                                            position: 'Outside', 
                                            name: 'text',
                                            font: { 
                                                fontWeight: '700',
                                                color: theme === 'light' ? '#111827' : '#ffffff',
                                                fontFamily: 'Courier New',
                                            },
                                            connectorStyle: { length: '20px' }
                                        }}
                                    >
                                    </CircularChart3DSeriesDirective>
                                </CircularChart3DSeriesCollectionDirective>
                            </CircularChart3DComponent>
                        ) : (
                            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 50 }}>
                                No earnings to display
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
// --- Updated Friends Layout with GameSelector support ---
interface UserProfile { id: string; username: string; email: string; }
interface FriendshipRequest { id: string; sender: string; }

const FriendsContent: React.FC = () => {
		const { user, fetchWithAuth } = useAuth();
		const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'add'>('friends');
		const [friends, setFriends] = useState<UserProfile[]>([]);
		const [requests, setRequests] = useState<FriendshipRequest[]>([]);
		const [targetEmail, setTargetEmail] = useState('');
		const [loading, setLoading] = useState(false);
		const [msg, setMsg] = useState<{type: 'error'|'success', text: string} | null>(null);
		
		// State to track who we are inviting
		const [inviteTarget, setInviteTarget] = useState<{id: string, username: string} | null>(null);

		const serverUrl = import.meta.env.VITE_SERVER_URL;

		const apiCall = useCallback(async (endpoint: string, method: string = 'GET', body?: any) => {
				try {
						const res = await fetchWithAuth(`${serverUrl}/api/friends${endpoint}`, {
								method: method,
								body: JSON.stringify(body),
								headers: !endpoint.includes("/accept") && method !== 'GET' ? { 'Content-Type': 'application/json' } : {}
						});
						if (res.ok) return await res.json();
				} catch (err: any) {
						setMsg({ type: 'error', text: err.message });
						return null;
				}
		}, [fetchWithAuth, serverUrl]);

		const refreshData = useCallback(async () => {
				setLoading(true);
				if (activeTab === 'friends') {
						const data = await apiCall('/');
						if (data) setFriends(data.data.map((d: { friend: UserProfile; }) => d.friend) || []);
				} else if (activeTab === 'requests') {
						const data = await apiCall('/requests');
						if (data) setRequests(data.data || []);
				}
				setLoading(false);
		}, [activeTab, apiCall]);

		useEffect(() => { if (user) refreshData(); }, [user, activeTab, refreshData]);

		const sendRequest = async (e: React.FormEvent) => {
				e.preventDefault();
				if (!targetEmail) return;
				const res = await apiCall('', 'POST', { email: targetEmail });
				if (res) {
						setMsg({ type: 'success', text: `Request sent to ${targetEmail}` });
						setTargetEmail('');
				}
		};

		const respondToRequest = async (id: string, accept: boolean) => {
				const endpoint = accept ? `/accept/${id}` : `/reject/${id}`;
				const method = accept ? 'POST' : 'DELETE';
				const res = await apiCall(endpoint, method);
				if (res) {
						setMsg({ type: 'success', text: accept ? 'Added' : 'Ignored' });
						refreshData();
				}
		};

		// --- INTERCEPT RENDER: If inviting, show GameSelector ---
		if (inviteTarget) {
				return (
						<div style={{ height: '100%' }}>
								<GameSelector 
										friendId={inviteTarget.id} 
										username={inviteTarget.username} 
										onClose={() => setInviteTarget(null)} 
								/>
						</div>
				);
		}

		return (
			<div className="friends-content-full">
				 <div className="friends-tabs">
						<button className={activeTab === 'friends' ? 'active' : ''} onClick={() => setActiveTab('friends')}>Friends</button>
						<button className={activeTab === 'requests' ? 'active' : ''} onClick={() => setActiveTab('requests')}>Requests {requests.length > 0 && `(${requests.length})`}</button>
						<button className={activeTab === 'add' ? 'active' : ''} onClick={() => setActiveTab('add')}>Add</button>
				 </div>
				 
				 {msg && <div className={`msg-banner ${msg.type}`}>{msg.text}</div>}

				 <div className="friends-list-container">
						{loading && <div>Loading...</div>}
						
						{activeTab === 'friends' && !loading && (
								<div className="simple-list">
										{friends.length === 0 && <p>No friends yet.</p>}
										{friends.map(f => (
												<div key={f.id} className="friend-row">
														<span className="name">{f.username}</span>
														<button 
																className="action-btn" 
																style={{ width: 'auto', padding: '0 8px', background: '#eab308' }}
																onClick={() => setInviteTarget({ id: f.id, username: f.username })}
																title="Invite to Game"
														>
															Invite
														</button>
												</div>
										))}
								</div>
						)}

						{activeTab === 'requests' && !loading && (
								<div className="simple-list">
										{requests.length === 0 && <p>No requests.</p>}
										{requests.map(r => (
												<div key={r.id} className="request-row">
														<span className="name">{r.sender}</span>
														<div className="actions">
																<button onClick={() => respondToRequest(r.id, true)} className="btn-small accept">✓</button>
																<button onClick={() => respondToRequest(r.id, false)} className="btn-small reject">✕</button>
														</div>
												</div>
										))}
								</div>
						)}

						{activeTab === 'add' && (
								<form onSubmit={sendRequest} className="add-form">
										<input 
											type="email" 
											placeholder="friend@email.com" 
											value={targetEmail} 
											onChange={e => setTargetEmail(e.target.value)} 
											required 
										/>
										<button type="submit" className="action-btn">Send Request</button>
								</form>
						)}
				 </div>
			</div>
		);
};

// --- BloboxIcon Component ---
const BloboxIcon = () => (
	<img 
		src="../../logo.png" 
		style={{ width: '420px', height: '220px', objectFit: 'contain' }} 
		alt="Blobox" 
	/>
);

// --- Dashboard Component ---
const Dashboard: React.FC = () => {
	const { isAuthenticated, logout, user } = useAuth();
	const { theme, toggleTheme } = useTheme();
	const gameRef = useRef<GameHandle>(null);
	// Track visibility of main windows in guest view
	const [visibleBoxes, setVisibleBoxes] = useState({
		login: true,
		blobox: true,
		about: true,
	});

	// Track if Blobox is expanded (showing auth content)
	const [bloboxExpanded, setBloboxExpanded] = useState(false);

	// --- NEW: Reset Password State ---
	const [showForgot, setShowForgot] = useState(false);
	const [resetToken, setResetToken] = useState<string | null>(null);
	const [resetSuccess, setResetSuccess] = useState(false);

	const reopenBox = (box: keyof typeof visibleBoxes) => {
		setVisibleBoxes(prev => ({ ...prev, [box]: true }));
	};

	// --- NEW: Reset Password Logic ---
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const token = params.get('resetToken');
		
		if (token) {
			setResetToken(token);
			// const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
			// window.history.replaceState({path: newUrl}, "", newUrl);
			if (isAuthenticated) logout();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Empty dependency array ensures this runs only on mount

	useEffect(() => {
		const handler = (event: MessageEvent) => {
			if (event.data.type === 'OPEN_FORGOT_PASSWORD') {
				setShowForgot(true);
			}
		};
		window.addEventListener('message', handler);
		return () => window.removeEventListener('message', handler);
	}, []);

	const handleResetSuccess = () => {
		setResetSuccess(true);
		
		// FIX: Clear the URL here, once we know the operation is successful
		window.history.replaceState({}, document.title, window.location.pathname);
		
		setTimeout(() => {
			setResetToken(null);
			setResetSuccess(false);
			reopenBox('login');
		}, 3000); 
	};
	// ---------------------------------

	const handleLogout = () => {
		if (gameRef.current)
		{
			gameRef.current.sendLogout();
		}

		logout();
	};

	const closedBoxes = Object.entries(visibleBoxes)
		.filter(([_, visible]) => !visible)
		.map(([name]) => name);

	const [pongOpen, setPongOpen] = useState(false);
	const [gamesTrigger, setGamesTrigger] = useState(0);

	const avatarRef = useRef<HTMLDivElement>(null);

	// Handle game invite acceptance - open Blobox and Pong
	useEffect(() => {
		const handler = () => {
			if (isAuthenticated) {
				setBloboxExpanded(true);
				setGamesTrigger(prev => prev + 1);
				setPongOpen(false);
				setTimeout(() => setPongOpen(true), 50);
			}
		};
		window.addEventListener('RESET_GAME_VIEW', handler);
		return () => window.removeEventListener('RESET_GAME_VIEW', handler);
	}, [isAuthenticated]);

	// When user logs in, auto-expand Blobox
	useEffect(() => {
		if (isAuthenticated && !bloboxExpanded) {
			setBloboxExpanded(true);
		}
	}, [isAuthenticated]);

	// Handle Blobox click - only expand if authenticated
	const handleBloboxClick = () => {
		if (isAuthenticated) {
			setBloboxExpanded(true);
		}
	};

	// Handle closing Blobox - return to guest view
	const handleBloboxClose = () => {
		setBloboxExpanded(false);
	};

	// Determine what to show
	const showGuestWindows = !bloboxExpanded;
	const showBloboxContent = bloboxExpanded && isAuthenticated;

	return (
		<div className="dashboard">
			{/* Reopen buttons for closed guest windows */}
			{showGuestWindows && closedBoxes.length > 0 && (
				<div className="closed-boxes-bar">
					{closedBoxes.map((box) => (
						<button
							key={box}
							className="reopen-btn"
							onClick={() => reopenBox(box as keyof typeof visibleBoxes)}
						>
							Open {box.charAt(0).toUpperCase() + box.slice(1)}
						</button>
					))}
				</div>
			)}
			
			<div className="dashboard-content">
				{/* --- NEW: Reset Password Overlay --- */}
				{resetToken && (
					<div style={{
						position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
						backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999, // Darker bg for better focus
						display: 'flex', alignItems: 'center', justifyContent: 'center',
						backdropFilter: 'blur(5px)' // Adds a nice blur effect to background
					}}>
						<div style={{ width: '400px', maxWidth: '95vw' }}>
							 {/* Simplified: Just one SubBox that is permanently open */}
							 <SubBox 
								title="Reset Password" 
								icon={<span>🔑</span>} 
								color="#ef4444" 
								defaultMaximized={true} // Forces it open
							 >
								<div style={{ paddingBottom: '20px' }}>
									{resetSuccess ? (
										<div style={{ padding: 40, textAlign: 'center', color: '#4ade80' }}>
											<h3 style={{ fontSize: '24px', marginBottom: '10px' }}>Success!</h3>
											<p>Password updated successfully.</p>
											<p style={{ fontSize: '13px', opacity: 0.7, marginTop: '10px' }}>Redirecting to login...</p>
										</div>
									) : (
										<ResetPassword token={resetToken} onSuccess={handleResetSuccess} />
									)}
								</div>
							 </SubBox>
						</div>
					</div>
				)}
				{/* ----------------------------------- */}

				{showBloboxContent ? (
					/* Blobox Expanded View - Wrapped in a container that looks like a parent window */
					<div className="blobox-container">
						{/* Restore button to go back to guest view */}
						<button 
							className="blobox-restore-btn" 
							onClick={handleBloboxClose}
							title="Back to Guest View"
						>
							{/* ↙ */}
						</button>

						<div className="blobox-inner">
							{/* Profile MainBox */}
							<MainBox 
								key="profile" 
								id="profile" 
								title="Profile" 
								icon={<ProfileIcon />} 
								color="#f59e0b"
							>
								<SubBox title="Wallet" icon={<WalletIcon />} color="#f59e0b">
									<WalletContent />
								</SubBox>
								<SubBox title="Statistics" icon={<StatsIcon />} color="#3b82f6">
									<StatsContent />
								</SubBox>
								<SubBox title="Account" icon={<span>👤</span>} color="#10b981">
									<div className="account-content">
										<div className='avatar' ref={avatarRef}>
											<ModelViewer />
										</div>
										<div style={{ textAlign: 'center', marginBottom: 6 }}>
											<div className="account-info">
												<div><strong>Username</strong> {user?.username || 'N/A'}</div>
												<div><strong>Email</strong> {user?.email || 'N/A'}</div>
											</div>
										</div>
										<div className="theme-switch-wrapper">
											<label className="theme-switch">
												<input type="checkbox" checked={theme === 'light'} onChange={toggleTheme} />
												<div className="slider">
													<span className="icon">🌙</span>
													<span className="icon">☀️</span>
												</div>
											</label>
										</div>
										<button className="action-btn" onClick={handleLogout}>Logout</button>
									</div>
								</SubBox>
							</MainBox>

							{/* Games MainBox */}
							<MainBox 
								key="games" 
								id="games" 
								title="Games" 
								icon={<GamesIcon />} 
								color="#ef4444" 
								triggerOpen={gamesTrigger}
							>
								<SubBox title="Pong" icon={<PongIcon />} color="#ec4899" isOpen={pongOpen} onOpenChange={setPongOpen}>
									<div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
										<Game ref={gameRef} />
									</div>
								</SubBox>
								<SubBox title="Mafia" icon={<MafiaIcon />} color="#dc2626">
									<div style={{padding: 20, textAlign: 'center', color: 'var(--text-secondary)'}}>Coming Soon</div>
								</SubBox>
							</MainBox>

							{/* Community MainBox */}
							<MainBox 
								key="community" 
								id="community" 
								title="Community" 
								icon={<CommunityIcon />} 
								color="#3b82f6"
							>
								<SubBox title="Friends" icon={<span>👫</span>} color="#3b82f6">
									<FriendsContent />
								</SubBox>
							</MainBox>
						</div>
					</div>
				) : (
					/* Guest View - Login, Blobox (collapsed unless logged in), About */
					<>
						{/* Login Window */}
						{visibleBoxes.login && (
							<MainBox 
								key="login" 
								id="login" 
								title="Login" 
								icon={<LoginIcon />} 
								color="#f59e0b"
							>
								<SubBox title="Sign In" icon={<LoginIcon />} color="#f59e0b">
									<Login />
								</SubBox>

								{/* --- NEW: Forgot Password SubBox --- */}
								{showForgot && (
									 <SubBox 
										title="Recovery" 
										icon={<span>❓</span>} 
										color="#f59e0b" 
										// defaultMaximized={true}
										triggerClose={!showForgot ? 1 : 0}
									 >
										<div style={{ position: 'relative', height: '100%' }}>
											<button 
												onClick={() => setShowForgot(false)}
												style={{ 
													position: 'absolute', 
													top: '-35px', 
													right: '-10px', 
													background: 'transparent', 
													border: 'none', 
													color: '#fff', 
													fontSize: '24px',
													fontWeight: 'bold',
													cursor: 'pointer', 
													zIndex: 20,
													width: '40px',
													height: '40px',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													opacity: 0.8,
													transition: 'opacity 0.2s'
												}}
												onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
												onMouseOut={(e) => e.currentTarget.style.opacity = '0.8'}
											>
												✕
											</button>
											<ForgotPassword />
										</div>
									 </SubBox>
								)}
								{/* ----------------------------------- */}

								<SubBox title="Create Account" icon={<RegisterIcon />} color="#6366f1">
									<Register />
								</SubBox>
							</MainBox>
						)}

						{/* Blobox Window - Shows logo, clicks to expand when authenticated */}
						{visibleBoxes.blobox && (
							<MainBox 
								key="blobox" 
								id="blobox" 
								title="Blobox" 
								icon={<BloboxIcon />} 
								color="#10b981"
								onClickWhenClosed={isAuthenticated ? handleBloboxClick : undefined}
							>
								{isAuthenticated ? (
									<SubBox 
										title="Enter Blobox"
										icon={<span>🚀</span>}
										color="#10b981" 
										defaultMaximized
									>
										<div style={{
											padding: 20, 
											display: 'flex', 
											flexDirection: 'column', 
											alignItems: 'center',
											textAlign: 'center',
											gap: 15
										}}>
											<h3>Welcome back, {user?.username}!</h3>
											<p>Click to enter your dashboard</p>
											<button 
												className="play-btn" 
												onClick={handleBloboxClick}
												style={{ padding: '12px 24px', fontSize: '16px' }}
											>
												🚀 Enter Blobox
											</button>
										</div>
									</SubBox>
								) : (
									<div className="blobox-guest-message">
										<span className="lock-icon">🔒</span>
										<h3>Welcome to Blobox</h3>
										<p>Please login to access your dashboard, games, and community features.</p>
									</div>
								)}
							</MainBox>
						)}

						{/* About Window */}
						{visibleBoxes.about && (
							<MainBox 
								key="about" 
								id="about" 
								title="About" 
								icon={<InfoIcon />} 
								color="#6366f1"
							>
								<SubBox
									title="Terms of Service"
									icon={<InfoIcon />}
									color="#2d30b7"
								>

								</SubBox>
								<SubBox 
									title="About Blobox" 
									icon={<InfoIcon />} 
									color="#6366f1" 
								>
									<div style={{
										padding: 20, 
										display: 'flex', 
										flexDirection: 'column', 
										alignItems: 'center',
										textAlign: 'center'
									}}>
										<h3>Welcome to Blobox</h3>
										<p>Lorem ipsum dolor sit amet...</p>
										<p style={{ marginTop: 10, color: 'var(--text-secondary)' }}>
											Play games, connect with friends, and earn rewards!
										</p>
									</div>
								</SubBox>
							</MainBox>
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default Dashboard;