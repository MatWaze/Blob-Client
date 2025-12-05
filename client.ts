interface User {
	id: number;
	username: string;
	email: string;
	walletAddress?: string;
}

interface MessageData {
	type: string;
	sessionId?: string;
	user?: User;
	message?: string;
}

interface Transaction {
	id: number;
	userId: number;
	type: string;
	amount: number;
	status: string;
	createdAt: string;
	updatedAt: string;
}

interface Game {
	id: number;
	createdAt: string;
	players: Array<{ userId: number; username: string; place: number; score: number }>;
}

type WindowType = 'login' | 'register' | 'game' | 'profile';

class TranscendenceClient {
	private currentSessionId: string | null = null;
	private currentUser: User | null = null;
	private isAuthenticated: boolean = false;
	private activeWindows: Set<WindowType> = new Set();
	private focusedWindow: WindowType | null = null;
	// Removed minimizedWindows
	private serverUrl: string = "http://localhost:4000";
	private gameUrl: string = "http://localhost:3000";
	private currentTheme: 'light' | 'dark' = 'dark';

	// Elements
	private welcomeScreen: HTMLElement;
	private loginWindow: HTMLElement;
	private registerWindow: HTMLElement;
	private gameWindow: HTMLElement;
	private profileWindow: HTMLElement;
	private loginFrame: HTMLIFrameElement;
	private registerFrame: HTMLIFrameElement;
	private gameFrame: HTMLIFrameElement;
	private loading: HTMLElement;
	
	// Buttons
	private themeCheckbox: HTMLInputElement;
	private loginBtn: HTMLButtonElement;
	private registerBtn: HTMLButtonElement;
	private gameBtn: HTMLButtonElement;
	private profileBtn: HTMLButtonElement;
	private logoutBtn: HTMLButtonElement;
	private welcomeLoginBtn: HTMLButtonElement;
	private welcomeRegisterBtn: HTMLButtonElement;
	private welcomeGameBtn: HTMLButtonElement;
	private welcomeProfileBtn: HTMLButtonElement;
	
	// Removed Taskbar items
    
    // Status elements
	// Removed authIndicator, authStatus, connectionIndicator, connectionStatus
	// private userInfo: HTMLElement;

	// Drag and Resize State
	private isDragging: boolean = false;
	private isResizing: boolean = false;
	private currentDragWindow: HTMLElement | null = null;
	private initialX: number = 0;
	private initialY: number = 0;
	private initialWidth: number = 0;
	private initialHeight: number = 0;
	private initialLeft: number = 0;
	private initialTop: number = 0;

	// Store state before maximizing
	private maximizedStates: Map<WindowType, {top: string, left: string, width: string, height: string}> = new Map();

	constructor() {
		// Elements
		this.welcomeScreen = document.getElementById('welcomeScreen')!;
		this.loginWindow = document.getElementById('loginWindow')!;
		this.registerWindow = document.getElementById('registerWindow')!;
		this.gameWindow = document.getElementById('gameWindow')!;
		this.profileWindow = document.getElementById('profileWindow')!;
		this.loginFrame = document.getElementById('loginFrame') as HTMLIFrameElement;
		this.registerFrame = document.getElementById('registerFrame') as HTMLIFrameElement;
		this.gameFrame = document.getElementById('gameFrame') as HTMLIFrameElement;
		this.loading = document.getElementById('loading')!;
		
		// Buttons
		this.themeCheckbox = document.getElementById('checkbox') as HTMLInputElement;
		this.loginBtn = document.getElementById('loginBtn') as HTMLButtonElement;
		this.registerBtn = document.getElementById('registerBtn') as HTMLButtonElement;
		this.gameBtn = document.getElementById('gameBtn') as HTMLButtonElement;
		this.profileBtn = document.getElementById('profileBtn') as HTMLButtonElement;
		this.logoutBtn = document.getElementById('logoutBtn') as HTMLButtonElement;
		this.welcomeLoginBtn = document.getElementById('welcomeLoginBtn') as HTMLButtonElement;
		this.welcomeRegisterBtn = document.getElementById('welcomeRegisterBtn') as HTMLButtonElement;
		this.welcomeGameBtn = document.getElementById('welcomeGameBtn') as HTMLButtonElement;
		this.welcomeProfileBtn = document.getElementById('welcomeProfileBtn') as HTMLButtonElement;
		
		// Removed Taskbar items initialization
        
        // Status elements
		// Removed authIndicator, authStatus, connectionIndicator, connectionStatus
		// this.userInfo = document.getElementById('userInfo')!;

		this.setupEventListeners();
		this.setupMessageListener();
		this.checkExistingSession();
		this.initializeTheme();
		this.setupWindowInteractions();
	}

	private setupEventListeners(): void {
		// Navigation buttons
		this.themeCheckbox.addEventListener('change', () => this.toggleTheme());
		this.loginBtn.onclick = () => this.showWindow('login');
		this.registerBtn.onclick = () => this.showWindow('register');
		this.gameBtn.onclick = () => this.showWindow('game');
		this.profileBtn.onclick = () => this.showWindow('profile');
		this.logoutBtn.onclick = () => this.handleLogout();
		
		// Welcome buttons - Use addEventListener
		this.welcomeLoginBtn.addEventListener('click', () => this.showWindow('login'));
		this.welcomeRegisterBtn.addEventListener('click', () => this.showWindow('register'));
		this.welcomeGameBtn.addEventListener('click', () => this.showWindow('game'));
		this.welcomeProfileBtn.addEventListener('click', () => this.showWindow('profile'));
		
		// Profile update button
		const updateWalletBtn = document.getElementById('updateWalletBtn');
		if (updateWalletBtn) {
			updateWalletBtn.onclick = () => this.updateWalletAddress();
		}
		
		// Window click handlers for focus
		this.loginWindow.addEventListener('mousedown', () => {
			if (this.activeWindows.has('login')) {
				this.focusWindow('login');
			}
		});
		
		this.registerWindow.addEventListener('mousedown', () => {
			if (this.activeWindows.has('register')) {
				this.focusWindow('register');
			}
		});
		
		this.gameWindow.addEventListener('mousedown', () => {
			if (this.activeWindows.has('game')) {
				this.focusWindow('game');
			}
		});
		
		this.profileWindow.addEventListener('mousedown', () => {
			if (this.activeWindows.has('profile')) {
				this.focusWindow('profile');
			}
		});
	}

	private setupMessageListener(): void {
		window.addEventListener('message', (event: MessageEvent<MessageData>) => {
			switch (event.data.type) {
				case 'LOGIN_SUCCESS':
					this.handleLoginSuccess(event.data);
					break;
				
				case 'SWITCH_TO_LOGIN':
					this.hideWindow('register');
					this.showWindow('login');
					break;
				
				case 'LOGOUT':
					this.handleLogout();
					break;

				case 'REQUEST_SESSION':
				case 'AUTH_FAILED':
					this.handleAuthFailed();
					break;
				
				case 'GAME_READY':
					this.updateConnectionStatus('Connected to Game', true);
					break;

				case 'BABYLON_READY':
					this.updateConnectionStatus('Babylon.js Scene Loaded', true);
					break;
					
				case 'BABYLON_ERROR':
					this.updateConnectionStatus('Babylon.js Error', false);
					break;

				case 'UPDATE_STATUS':
					const isSuccess = (event.data as any).status === 'success';
					this.updateConnectionStatus(event.data.message || '', isSuccess);
					break;
			}
		});
	}

	private initializeTheme(): void {
		const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
		if (savedTheme) {
			this.currentTheme = savedTheme;
			document.body.classList.toggle('light-theme', savedTheme === 'light');
			this.themeCheckbox.checked = savedTheme === 'light';
		}
	}

	private toggleTheme(): void {
		this.currentTheme = this.themeCheckbox.checked ? 'light' : 'dark';
		document.body.classList.toggle('light-theme', this.currentTheme === 'light');
		localStorage.setItem('theme', this.currentTheme);
		
		// Broadcast theme change to iframes
		const frames = document.querySelectorAll('iframe');
		frames.forEach(frame => {
			frame.contentWindow?.postMessage({
				type: 'THEME_CHANGE',
				theme: this.currentTheme
			}, '*');
		});
	}

	private async checkExistingSession(): Promise<void> {
		try {
			const response = await fetch(`${this.serverUrl}/api/users/tokens`, {
				credentials: 'include'
			});

			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					this.handleLoginSuccess({
						type: 'LOGIN_SUCCESS',
						user: data.user
					});
				} else {
					this.disableGameAccess();
				}
			} else {
				this.disableGameAccess();
			}
		} catch (error) {
			console.error('Session check failed:', error);
			this.disableGameAccess();
		}
	}

	public showWindow(windowType: WindowType): void {
		console.log(`Showing ${windowType} window`);
		
		this.welcomeScreen.style.display = 'none';
		
		if (this.activeWindows.has(windowType)) {
			this.focusWindow(windowType);
			return;
		}
		
		// Removed minimized check
		
		const windowElement = this.getWindowElement(windowType);
		if (!windowElement) return;
		
		windowElement.classList.remove('active'); // Reset to ensure clean state
		windowElement.classList.add('active');
		
		const btnElement = this.getButtonElement(windowType);
		// Removed taskbar logic
		
		if (btnElement) btnElement.classList.add('active');
		
		// Load iframe if needed
		if (windowType === 'login') {
			const frame = windowElement.querySelector('iframe') as HTMLIFrameElement;
			if (!frame.src || frame.src === window.location.href) {
				frame.src = 'login.html';
			}
		} else if (windowType === 'register') {
			const frame = windowElement.querySelector('iframe') as HTMLIFrameElement;
			if (!frame.src || frame.src === window.location.href) {
				frame.src = 'register.html';
			}
		} else if (windowType === 'game') {
			if (!this.isAuthenticated) {
				this.updateAuthStatus('Please login first', false);
				this.showWindow('login');
				return;
			}
			const frame = windowElement.querySelector('iframe') as HTMLIFrameElement;
			if (!frame.src || frame.src === window.location.href) {
				frame.src = this.gameUrl;
			}
		} else if (windowType === 'profile') {
			if (!this.isAuthenticated) {
				alert('Please login first to view your profile');
				return;
			}
			this.updateProfileWindow();
		}
		
		this.activeWindows.add(windowType);
		this.focusWindow(windowType);
		this.arrangeWindows();
	}

	private focusWindow(windowType: WindowType): void {
		console.log(`Focusing ${windowType} window`);
		
		if (!this.activeWindows.has(windowType)) {
			console.log(`Cannot focus ${windowType} - not in active windows`);
			return;
		}
		
		// Remove focus from all windows
		[this.loginWindow, this.registerWindow, this.gameWindow, this.profileWindow].forEach(win => {
			win.classList.remove('focused');
		});
		
		// Add unfocused class to all active windows
		this.activeWindows.forEach(type => {
			const win = this.getWindowElement(type);
			if (win) win.classList.add('unfocused');
		});
		
		// Focus the selected window
		const windowElement = this.getWindowElement(windowType);
		if (windowElement) {
			windowElement.classList.add('focused');
			windowElement.classList.remove('unfocused');
			this.focusedWindow = windowType;
		}
	}

	private arrangeWindows(): void {
		const activeCount = this.activeWindows.size;
		const activeWindowsArray = Array.from(this.activeWindows);
		
		const allGridClasses = ['grid-1', 'grid-2-1', 'grid-2-2', 'grid-3-1', 'grid-3-2', 'grid-3-3', 'grid-4-1', 'grid-4-2', 'grid-4-3', 'grid-4-4'];
		[this.loginWindow, this.registerWindow, this.gameWindow, this.profileWindow].forEach(win => {
			win.classList.remove(...allGridClasses);
		});
		
		if (activeCount === 0) {
			this.showWelcomeScreen();
		} else if (activeCount === 1) {
			this.getWindowElement(activeWindowsArray[0])?.classList.add('grid-1');
		} else if (activeCount === 2) {
			this.getWindowElement(activeWindowsArray[0])?.classList.add('grid-2-1');
			this.getWindowElement(activeWindowsArray[1])?.classList.add('grid-2-2');
		} else if (activeCount === 3) {
			this.getWindowElement(activeWindowsArray[0])?.classList.add('grid-3-1');
			this.getWindowElement(activeWindowsArray[1])?.classList.add('grid-3-2');
			this.getWindowElement(activeWindowsArray[2])?.classList.add('grid-3-3');
		} else if (activeCount >= 4) {
			const gridPositions = ['grid-4-1', 'grid-4-2', 'grid-4-3', 'grid-4-4'];
			for (let i = 0; i < Math.min(4, activeCount); i++) {
				this.getWindowElement(activeWindowsArray[i])?.classList.add(gridPositions[i]);
			}
		}
	}

	private getWindowElement(windowType: WindowType): HTMLElement | null {
		switch (windowType) {
			case 'login': return this.loginWindow;
			case 'register': return this.registerWindow;
			case 'game': return this.gameWindow;
			case 'profile': return this.profileWindow;
			default: return null;
		}
	}

	private getButtonElement(windowType: WindowType): HTMLButtonElement | null {
		switch (windowType) {
			case 'login': return this.loginBtn;
			case 'register': return this.registerBtn;
			case 'game': return this.gameBtn;
			case 'profile': return this.profileBtn;
			default: return null;
		}
	}

	private getTaskbarElement(windowType: WindowType): HTMLElement | null {
		return null; // Taskbar removed
	}

	public hideWindow(windowType: WindowType): void {
        console.log(`Hiding ${windowType} window`);
        
        const windowElement = this.getWindowElement(windowType);
        if (!windowElement) return;
        
        // Reset maximized state when closing
        windowElement.classList.remove('maximized');
        this.maximizedStates.delete(windowType);

        // FIX: Clear inline styles so the window resets to default CSS position/size
        // This ensures the window is visible and correctly positioned when reopened
        windowElement.style.top = '';
        windowElement.style.left = '';
        windowElement.style.width = '';
        windowElement.style.height = '';

        windowElement.classList.remove('active', 'focused', 'unfocused', 'left-half', 'right-half');
        
        const btnElement = this.getButtonElement(windowType);
		// Removed taskbar logic
		
		if (btnElement) btnElement.classList.remove('active');
		
		// Removed minimized logic
		this.activeWindows.delete(windowType);
		
		if (this.focusedWindow === windowType) {
			const remainingWindows = Array.from(this.activeWindows);
			if (remainingWindows.length > 0) {
				this.focusWindow(remainingWindows[0]);
			} else {
				this.focusedWindow = null;
			}
		}
		
		this.arrangeWindows();
		
		if (this.activeWindows.size === 0) {
		 setTimeout(() => {
			 this.showWelcomeScreen();
		 }, 300);
		}
	}

	// Removed minimizeWindow and restoreWindow methods

	private showWelcomeScreen(): void {
		if (this.activeWindows.size === 0) {
			this.welcomeScreen.style.display = 'flex';
			this.focusedWindow = null;
			
			// Ensure buttons are correctly enabled/disabled based on auth state
			this.welcomeGameBtn.disabled = !this.isAuthenticated;
			this.welcomeProfileBtn.disabled = !this.isAuthenticated;
		}
	}

	public switchProfileTab(tabName: string): void {
		console.log(`Switching to profile tab: ${tabName}`);
		
		const tabs = document.querySelectorAll('.profile-tab');
		const sections = document.querySelectorAll('.profile-section');
		
		tabs.forEach(tab => tab.classList.remove('active'));
		sections.forEach(section => section.classList.remove('active'));
		
		const activeTab = document.querySelector(`[onclick="client.switchProfileTab('${tabName}')"]`);
		// Capitalize first letter for section ID: info -> Info, transactions -> Transactions
		const sectionId = `profileSection${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`;
		const activeSection = document.getElementById(sectionId);
		
		console.log('Looking for section:', sectionId);
		console.log('Found section:', activeSection);
		
		if (activeTab) activeTab.classList.add('active');
		if (activeSection) {
			activeSection.classList.add('active');
			console.log('Section is now active');
		}
		
		if (tabName === 'transactions') {
			this.loadTransactions();
		} else if (tabName === 'games') {
			this.loadRecentGames();
		}
	}

	private updateProfileWindow(): void {
		if (this.currentUser) {
			const usernameEl = document.getElementById('profileUsername');
			const emailEl = document.getElementById('profileEmail');
			const walletInput = document.getElementById('profileWalletInput') as HTMLInputElement;
			
			if (usernameEl) usernameEl.textContent = this.currentUser.username;
			if (emailEl) emailEl.textContent = this.currentUser.email;
			if (walletInput) walletInput.value = this.currentUser.walletAddress || '';
		}
	}

	private async loadTransactions(): Promise<void> {
		const container = document.getElementById('transactionsContainer');
		if (!container) return;
		
		container.innerHTML = '<div class="loading-state"><div class="loading-spinner-small"></div><p>Loading transactions...</p></div>';
		
		try {
			const response = await fetch(`${this.serverUrl}/api/transactions`, {
				method: 'GET',
				credentials: 'include'
			});
			
			if (response.ok) {
				const data = await response.json();
				const transactions = data.transactions || [];
				
				if (transactions.length === 0) {
					container.innerHTML = '<div class="empty-state">No transactions found</div>';
					return;
				}
				
				let html = '<div class="transaction-list">';
				transactions.forEach((tx: any) => {
					const statusClass = tx.status === 'completed' ? 'status-completed' : 
									  tx.status === 'pending' ? 'status-pending' : 'status-failed';
					const date = new Date(tx.createdAt).toLocaleString();
					
					html += `
						<div class="transaction-item">
							<div class="transaction-header">
								<span>${tx.type || 'Transaction'}</span>
								<span class="transaction-status ${statusClass}">${tx.status || 'unknown'}</span>
							</div>
							<div class="transaction-details">
								<div>Amount: ${tx.amount || 0} tokens</div>
								<div>Date: ${date}</div>
								${tx.transactionHash ? `<div>Hash: ${tx.transactionHash.slice(0, 20)}...</div>` : ''}
							</div>
						</div>
					`;
				});
				html += '</div>';
				
				container.innerHTML = html;
			} else {
				container.innerHTML = '<div class="empty-state">Failed to load transactions</div>';
			}
		} catch (error) {
			console.error('Failed to load transactions:', error);
			container.innerHTML = '<div class="empty-state">Failed to load transactions</div>';
		}
	}

	private async loadRecentGames(): Promise<void> {
		const container = document.getElementById('gamesContainer');
		if (!container) return;
		
		container.innerHTML = '<div class="loading-state"><div class="loading-spinner-small"></div><p>Loading games...</p></div>';
		
		try {
			const response = await fetch(`${this.serverUrl}/api/tournaments`, {
				method: 'GET',
				credentials: 'include'
			});
			
			if (response.ok) {
				const data = await response.json();
				console.log('Games data received:', data);
				const games = data.tournaments || [];
				console.log('Games array:', games);
				
				if (games.length === 0) {
					container.innerHTML = '<div class="empty-state">No games played in the last week</div>';
					return;
				}
				
				let html = '<div class="game-list">';
				games.forEach((game: any) => {
					console.log('Processing game:', game);
					const date = new Date(game.createdAt).toLocaleString();
					
					html += `
						<div class="game-item">
							<div class="game-header">
								<span>${game.gameName || game.name || `Game #${game.id}`}</span>
							</div>
							<div class="game-details">
								<div>Placement: ${game.placementName || game.placement || 'N/A'}</div>
								<div>Date: ${date}</div>
							</div>
						</div>
					`;
				});
				html += '</div>';
				
				console.log('Final HTML:', html);
				container.innerHTML = html;
			} else {
				console.error('Failed to load games, status:', response.status);
				container.innerHTML = '<div class="empty-state">Failed to load games</div>';
			}
		} catch (error) {
			console.error('Failed to load games:', error);
			container.innerHTML = '<div class="empty-state">Failed to load recent games</div>';
		}
	}

	private async updateWalletAddress(): Promise<void> {
		const walletInput = document.getElementById('profileWalletInput') as HTMLInputElement;
		if (!walletInput) return;
		
		const newAddress = walletInput.value.trim();
		
		try {
			const response = await fetch(`${this.serverUrl}/api/users/wallet`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include',
				body: JSON.stringify({ walletAddress: newAddress })
			});
			
			if (response.ok) {
				const data = await response.json();
				if (this.currentUser) {
					this.currentUser.walletAddress = newAddress;
				}
				alert('Wallet address updated successfully!');
			} else {
				const error = await response.json();
				alert(`Failed to update wallet: ${error.message || 'Unknown error'}`);
			}
		} catch (error) {
			console.error('Failed to update wallet:', error);
			alert('Network error. Please try again.');
		}
	}

	private handleLoginSuccess(data: MessageData): void {
		console.log('Login successful:', data);
		this.currentUser = data.user || null;
		this.isAuthenticated = true;
		
		this.enableGameAccess();
		this.updateUserInfo(this.currentUser);
		this.hideWindow('login');
		this.hideWindow('register');
	}

	public async handleLogout(): Promise<void> {
		try
		{
			await fetch(`${this.serverUrl}/api/users/logout`, {
				method: 'POST',
				credentials: 'include'
			});

			this.gameFrame.contentWindow?.postMessage({ type: "LOGOUT" }, "*");
		}
		catch (error)
		{
			console.error('Logout error:', error);
		}
		
		this.currentUser = null;
		this.currentSessionId = null;
		this.isAuthenticated = false;
		
		this.hideWindow('game');
		this.hideWindow('profile');
		
		this.disableGameAccess();
		this.updateUserInfo(null);
		
		if (this.activeWindows.size === 0) {
		 this.showWelcomeScreen();
		}
	}

	private handleAuthFailed(): void {
		this.disableGameAccess();
		this.updateAuthStatus('Authentication failed', false);
	}

	private enableGameAccess(): void {
		this.gameBtn.disabled = false;
		this.profileBtn.disabled = false;
		this.welcomeGameBtn.disabled = false;
		this.welcomeProfileBtn.disabled = false;
		this.loginBtn.style.display = 'none';
		this.registerBtn.style.display = 'none';
		this.welcomeLoginBtn.style.display = 'none';
		this.welcomeRegisterBtn.style.display = 'none';
		this.logoutBtn.style.display = 'block';
		this.updateAuthStatus('Authenticated', true);
	}

	private disableGameAccess(): void {
		this.gameBtn.disabled = true;
		this.profileBtn.disabled = true;
		this.welcomeGameBtn.disabled = true;
		this.welcomeProfileBtn.disabled = true;
		this.loginBtn.style.display = 'block';
		this.registerBtn.style.display = 'block';
		this.welcomeLoginBtn.style.display = 'block';
		this.welcomeRegisterBtn.style.display = 'block';
		this.logoutBtn.style.display = 'none';
		this.updateAuthStatus('Not Authenticated', false);
	}

	private updateAuthStatus(message: string, isConnected: boolean): void {
		// Removed status indicator updates
	}

	private updateConnectionStatus(message: string, isConnected: boolean): void {
		// Removed status indicator updates
	}

	private updateUserInfo(user: User | null): void {
		// User info display removed
	}

	private showLoading(message: string = 'Loading...'): void {
		const loadingMessage = document.getElementById('loadingMessage');
		if (loadingMessage) loadingMessage.textContent = message;
		this.loading.classList.remove('hidden');
	}

	private hideLoading(): void {
		this.loading.classList.add('hidden');
	}

	private setupWindowInteractions(): void {
        const windows = document.querySelectorAll('.window');

        windows.forEach((win) => {
            const header = win.querySelector('.window-header') as HTMLElement;
            const resizeHandle = win.querySelector('.resize-handle') as HTMLElement;
            const element = win as HTMLElement;

            // --- Dragging Logic ---
            // Attach to the element (window) instead of header to allow dragging from anywhere
            element.addEventListener('mousedown', (e) => {
                const target = e.target as HTMLElement;

                // Prevent drag if maximized
                if (element.classList.contains('maximized')) return;

                // Prevent drag if clicking on interactive elements
                if (['INPUT', 'BUTTON', 'TEXTAREA', 'SELECT', 'A'].includes(target.tagName) || 
                    target.closest('.window-control') || 
                    target.closest('.resize-handle') ||
                    target.closest('.profile-tab') ||
                    target.closest('button')) {
                    return;
                }
                
                // Prevent default browser selection behavior
                e.preventDefault();

                this.isDragging = true;
                this.currentDragWindow = element;
                
                // Disable text selection globally
                document.body.style.userSelect = 'none';
                
                this.toggleIframePointerEvents(false);

                this.initialLeft = element.offsetLeft;
                this.initialTop = element.offsetTop;
                
                // Capture dimensions for boundary checks
                this.initialWidth = element.offsetWidth;
                this.initialHeight = element.offsetHeight;
                
                const style = window.getComputedStyle(element);
                const currentWidth = style.width;
                const currentHeight = style.height;

                // 3. Lock the element to these pixel coordinates immediately
                element.style.left = `${this.initialLeft}px`;
                element.style.top = `${this.initialTop}px`;
                element.style.width = currentWidth;
                element.style.height = currentHeight;
                
                // 4. Now safe to remove grid classes
                this.removeGridClasses(element);
                
                this.initialX = e.clientX;
                this.initialY = e.clientY;
                
                this.focusWindow(this.getWindowTypeFromId(element.id));
            });

            // --- Resizing Logic ---
            if (resizeHandle) {
                resizeHandle.addEventListener('mousedown', (e) => {
                    // Prevent resize if maximized
                    if (element.classList.contains('maximized')) return;

                    // Prevent default browser selection behavior
                    e.preventDefault();

                    this.isResizing = true;
                    this.currentDragWindow = element;
                    
                    // Disable text selection globally
                    document.body.style.userSelect = 'none';
                    
                    this.toggleIframePointerEvents(false);
                    
                    const style = window.getComputedStyle(element);
                    this.initialWidth = parseInt(style.width, 10);
                    this.initialHeight = parseInt(style.height, 10);
                    
                    this.initialLeft = element.offsetLeft;
                    this.initialTop = element.offsetTop;
                    
                    element.style.left = `${this.initialLeft}px`;
                    element.style.top = `${this.initialTop}px`;
                    element.style.width = `${this.initialWidth}px`;
                    element.style.height = `${this.initialHeight}px`;
                    
                    this.removeGridClasses(element);
                    
                    this.initialX = e.clientX;
                    this.initialY = e.clientY;
                    
                    this.focusWindow(this.getWindowTypeFromId(element.id));
                    e.stopPropagation();
                });
            }
        });

        // Global Mouse Move
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging && this.currentDragWindow) {
                e.preventDefault();
                const dx = e.clientX - this.initialX;
                const dy = e.clientY - this.initialY;
                
                let newLeft = this.initialLeft + dx;
                let newTop = this.initialTop + dy;

                // Boundary Constraints: Keep ENTIRE window inside the viewport
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                const winWidth = this.initialWidth;
                const winHeight = this.initialHeight;

                // Horizontal bounds
                if (newLeft < 0) {
                    newLeft = 0;
                } else if (newLeft + winWidth > viewportWidth) {
                    newLeft = viewportWidth - winWidth;
                    // If window is wider than viewport, align to left
                    if (newLeft < 0) newLeft = 0;
                }

                // Vertical bounds
                if (newTop < 0) {
                    newTop = 0;
                } else if (newTop + winHeight > viewportHeight) {
                    newTop = viewportHeight - winHeight;
                    // If window is taller than viewport, align to top
                    if (newTop < 0) newTop = 0;
                }
                
                this.currentDragWindow.style.left = `${newLeft}px`;
                this.currentDragWindow.style.top = `${newTop}px`;
            }

            if (this.isResizing && this.currentDragWindow) {
                e.preventDefault();
                const dx = e.clientX - this.initialX;
                const dy = e.clientY - this.initialY;
                
                const newWidth = Math.max(300, this.initialWidth + dx);
                const newHeight = Math.max(200, this.initialHeight + dy);

                this.currentDragWindow.style.width = `${newWidth}px`;
                this.currentDragWindow.style.height = `${newHeight}px`;
            }
        });

        // Global Mouse Up
        document.addEventListener('mouseup', () => {
            // Removed off-screen check since boundaries are enforced
            if (this.isDragging || this.isResizing) {
                this.isDragging = false;
                this.isResizing = false;
                this.currentDragWindow = null;
                this.toggleIframePointerEvents(true);
            }
        });
    }

    private toggleIframePointerEvents(enable: boolean): void {
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            // When dragging, set pointer-events to none.
            // When done, remove the inline style so it falls back to CSS rules.
            // This prevents hidden iframes from blocking clicks on the welcome screen.
            iframe.style.pointerEvents = enable ? '' : 'none';
        });
    }

    private removeGridClasses(element: HTMLElement): void {
		// Remove any class starting with 'grid-'
		const classes = Array.from(element.classList);
		classes.forEach(cls => {
			if (cls.startsWith('grid-')) {
				element.classList.remove(cls);
			}
		});
	}

	private getWindowTypeFromId(id: string): WindowType {
		if (id.includes('login')) return 'login';
		if (id.includes('register')) return 'register';
		if (id.includes('game')) return 'game';
		if (id.includes('profile')) return 'profile';
		return 'login'; // Default to login
	}

	// New method for maximizing
	public toggleMaximize(windowType: WindowType): void {
        const win = this.getWindowElement(windowType);
        if (!win) return;

        if (this.maximizedStates.has(windowType)) {
            // Restore
            const state = this.maximizedStates.get(windowType)!;
            win.style.top = state.top;
            win.style.left = state.left;
            win.style.width = state.width;
            win.style.height = state.height;
            win.classList.remove('maximized');
            this.maximizedStates.delete(windowType);
        } else {
            // Maximize
            this.maximizedStates.set(windowType, {
                top: win.style.top,
                left: win.style.left,
                width: win.style.width,
                height: win.style.height
            });
            win.classList.add('maximized');
        }
    }
}

// Declare global client variable
declare global {
	interface Window {
		client: TranscendenceClient;
	}
}

// Initialize the client and expose it globally
window.addEventListener('load', () => {
	(window as any).client = new TranscendenceClient();
});

// Export to make this a module
export {};
