import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ModelViewer from './ModelViewer';

export const ProfileAvatar: React.FC = () => {
	const { fetchWithAuth } = useAuth();
	const serverUrl = import.meta.env.VITE_SERVER_URL;
	const containerRef = React.useRef<HTMLDivElement>(null);
	
	const [nfts, setNfts] = useState<any[]>([]);
	const [selectedTokenId, setSelectedTokenId] = useState<string>('');
	const [baseModelUrl, setBaseModelUrl] = useState<string>(''); 
	const [loading, setLoading] = useState(true);

	// NEW: Track the currently saved default token and loading state for the button
	const [defaultTokenId, setDefaultTokenId] = useState<string>('');
	const [isSettingDefault, setIsSettingDefault] = useState(false);
	const [responsiveModelScale, setResponsiveModelScale] = useState(2.4);

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;

		const updateScale = () => {
			const width = el.clientWidth;
			if (width <= 210) setResponsiveModelScale(1.2); // smallest subbox
			else if (width <= 260) setResponsiveModelScale(2.1);
			else if (width <= 320) setResponsiveModelScale(2.25);
			else setResponsiveModelScale(2.4);
		};

		updateScale();

		const observer = new ResizeObserver(updateScale);
		observer.observe(el);

		return () => observer.disconnect();
	}, []);

	// 1. Fetch the user's NFT inventory AND their default Avatar
	useEffect(() => {
		const loadLockerAndDefault = async () => {
			try {
				// Fetch both inventory and default profile avatar simultaneously
				const [inventoryRes, defaultRes] = await Promise.all([
					fetchWithAuth(`${serverUrl}/api/nft/user?gameType=All`),
					fetchWithAuth(`${serverUrl}/api/nft/user/default?gameType=Avatar`)
				]);

				let fetchedNfts: {
					tokenId: any;
					name: any;
					description: any;
					image: string;
					model: any;
				}[] = [];

				if (inventoryRes.ok) {
					fetchedNfts = await inventoryRes.json();
					setNfts(fetchedNfts);
				}

				let currentDefaultId = '';
				if (defaultRes.ok) {
					const defaultData = await defaultRes.json();
					// If a default exists, extract its tokenId
					if (defaultData && defaultData.tokenId) {
						currentDefaultId = defaultData.tokenId;
						setDefaultTokenId(currentDefaultId);
					}
				}

				// Logic for initial selection:
				// If they have a default, and they still own it, show that first.
				// Otherwise, show their first NFT in the list.
				if (currentDefaultId && fetchedNfts.some(nft => nft.tokenId === currentDefaultId)) {
					setSelectedTokenId(currentDefaultId);
				} else if (fetchedNfts.length > 0) {
					setSelectedTokenId(fetchedNfts[0].tokenId);
				}

			} catch (err) {
				console.error("Failed to load locker data", err);
			} finally {
				setLoading(false);
			}
		};

		loadLockerAndDefault();
	}, [fetchWithAuth, serverUrl]);

	const activeSkin = nfts.find(nft => nft.tokenId === selectedTokenId);

	// 2. Fetch the GLB URL based on the active skin's base model name
    useEffect(() => {
        const fetchGlbUrl = async () => {
            // THE FIX: If the inventory is still loading from the database, do nothing! Just wait.
            if (loading) return;

            // If loading is finished and they TRULY have no skin, then show David.
            if (!activeSkin || !activeSkin.model || activeSkin.model === "Unknown") {
                setBaseModelUrl('../../DavidLow.glb');
                return;
            }

            try {
                const res = await fetchWithAuth(`${serverUrl}/api/nft/skin?name=${activeSkin.model}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.url) {
                        setBaseModelUrl(data.url);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch base GLB model", err);
            }
        };

        fetchGlbUrl();
    }, [activeSkin?.model, fetchWithAuth, serverUrl, loading]); // <-- Don't forget to add 'loading' to the dependency array!

	// 3. NEW: Handle setting the currently viewed skin as the Avatar default
	const handleSetDefault = async () => {
		if (!selectedTokenId) return;
		
		setIsSettingDefault(true);
		try {
			const res = await fetchWithAuth(`${serverUrl}/api/nft/user/default`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ 
					tokenId: selectedTokenId, 
					gameType: 'Avatar' // Specifically locking this to the site-wide Avatar
				})
			});

			if (res.ok) {
				setDefaultTokenId(selectedTokenId);
			} else {
				console.error("Failed to set default skin");
			}
		} catch (error) {
			console.error("Network error setting default skin", error);
		} finally {
			setIsSettingDefault(false);
		}
	};

	const isCurrentDefault = selectedTokenId === defaultTokenId;

	return (
		<div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%', minHeight: 0 }}>
			
			<div className="avatar" style={{ margin: '0 auto' }}>
				<ModelViewer 
					url={baseModelUrl}
					textureUrl={activeSkin?.image}
					modelScale={responsiveModelScale}
				/>
			</div>

			{loading ? (
				<span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Loading locker...</span>
			) : (
				<div style={{ width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
					<select 
						value={selectedTokenId} 
						onChange={(e) => setSelectedTokenId(e.target.value)}
						className="market-select"
						style={{ width: '100%', textAlign: 'center', padding: '10px', borderRadius: '8px' }}
					>
						{nfts.length === 0 ? (
							<option value="" disabled>No Skins Owned</option>
						) : (
							nfts.map(nft => (
								<option key={nft.tokenId} value={nft.tokenId}>
									{nft.name}
								</option>
							))
						)}
					</select>

					{/* NEW: Set Default Button */}
					{nfts.length > 0 && (
						<button 
							className={`action-btn ${isCurrentDefault ? 'success' : ''}`}
							onClick={handleSetDefault}
							disabled={isCurrentDefault || isSettingDefault}
							style={{ 
								width: '100%', 
								padding: '8px', 
								opacity: isCurrentDefault ? 0.7 : 1 
							}}
						>
							{isSettingDefault ? 'Saving...' : (isCurrentDefault ? '★ Current Profile Avatar' : 'Set as Profile Avatar')}
						</button>
					)}
				</div>
			)}
		</div>
	);
};