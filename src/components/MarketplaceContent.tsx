import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ModelViewer from './ModelViewer'; // Make sure this is imported!
import "./MarketplaceContent.css";

interface Skin {
	id: string;
	name: string;
	url: string;
}

interface NftKey {
	quantity: number;
	name: string;
	description: string;
	key: string;
	skins: Skin[];
}

export const MarketplaceContent: React.FC = () => {
	const { fetchWithAuth } = useAuth();
	const { theme } = useTheme();
	const serverUrl = import.meta.env.VITE_SERVER_URL;

	const [keys, setKeys] = useState<NftKey[]>([]);
	const [loading, setLoading] = useState(true);
	const [msg, setMsg] = useState<{ type: 'error' | 'success', text: string } | null>(null);

	// Form State
	const [selectedKey, setSelectedKey] = useState<string>('');
	const [selectedSkinId, setSelectedSkinId] = useState<string>('');
	const [uploadFile, setUploadFile] = useState<File | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [skinName, setSkinName] = useState<string>('');
    const [skinDescription, setSkinDescription] = useState<string>('');

	// Carousel State
	const [activeSkinIndex, setActiveSkinIndex] = useState(0);

	// Fetch User Keys
	useEffect(() => {
		const loadKeys = async () => {
			try {
				const res = await fetchWithAuth(`${serverUrl}/api/nft/user/keys`);
				if (res.ok) {
					const data: NftKey[] = await res.json();
					setKeys(data);
				} else {
					setKeys([]);
				}
			} catch (err) {
				console.error("Failed to load keys", err);
				setKeys([]);
			} finally {
				setLoading(false);
			}
		};
		loadKeys();
	}, [fetchWithAuth, serverUrl]);

	// Derived state for the currently selected key
	const activeKeyData = keys.find(k => k.key === selectedKey);
	const availableSkins = activeKeyData?.skins || [];

	// When the user changes their Key, reset the carousel to the first skin
	useEffect(() => {
		if (availableSkins.length > 0) {
			setActiveSkinIndex(0);
			setSelectedSkinId(availableSkins[0].id);
		} else {
			setSelectedSkinId('');
		}
	}, [selectedKey]); // We only want this to run when the selectedKey string changes

	// Carousel Handlers
	const handleNextSkin = () => {
		const nextIndex = (activeSkinIndex + 1) % availableSkins.length;
		setActiveSkinIndex(nextIndex);
		setSelectedSkinId(availableSkins[nextIndex].id);
	};

	const handlePrevSkin = () => {
		const prevIndex = activeSkinIndex === 0 ? availableSkins.length - 1 : activeSkinIndex - 1;
		setActiveSkinIndex(prevIndex);
		setSelectedSkinId(availableSkins[prevIndex].id);
	};

	// Form Submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedKey || !selectedSkinId || !uploadFile) {
			setMsg({ type: 'error', text: 'Please fill out all fields and upload a file.' });
			return;
		}

		setIsSubmitting(true);
		setMsg(null);

		const formData = new FormData();
		formData.append('key', selectedKey);
		formData.append('skinId', selectedSkinId);
		formData.append('name', skinName);               // NEW
        formData.append('description', skinDescription); // NEW
		
		formData.append('skinFile', uploadFile);
		try {
			const res = await fetchWithAuth(`${serverUrl}/api/nft/user`, {
				method: 'POST',
				body: formData 
			});

			if (res.ok) {
				const data = await res.json();
				setMsg({ type: 'success', text: data.message || 'Skin created successfully!' });
				setSelectedKey('');
				setUploadFile(null);
			} else {
				setMsg({ type: 'error', text: 'Failed to create skin.' });
			}
		} catch (err) {
			setMsg({ type: 'error', text: 'Network error occurred.' });
		} finally {
			setIsSubmitting(false);
		}
	};

	if (loading) return <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading inventory...</div>;

	if (keys.length === 0) {
		return (
			<div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
				<span style={{ fontSize: '40px', display: 'block', marginBottom: '15px' }}>🗝️</span>
				<h3>Empty Inventory</h3>
				<p>You have no keys to create a skin.</p>
			</div>
		);
	}

	return (
		<div className="marketplace-content">
			<form onSubmit={handleSubmit} className="marketplace-form">
				
				{/* 1. SELECT KEY */}
				<div className="input-group">
					<label>Select Skin</label>
					<select 
						value={selectedKey} 
						onChange={(e) => setSelectedKey(e.target.value)}
						required
						className="market-select"
					>
						<option value="" disabled>-- Choose a Key --</option>
						{keys.map((k, index) => (
							<option key={`${k.key}-${index}`} value={k.key}>
								{k.name} ✕ {k.quantity}
							</option>
						))}
					</select>
				</div>

				{/* 2. 3D SKIN CAROUSEL */}
				{selectedKey && availableSkins.length > 0 && (
					<div className="input-group">
						<label>Select Base Model</label>
						<div className="skin-carousel">
							<button type="button" className="carousel-nav-btn" onClick={handlePrevSkin}>
								◀
							</button>
							
							<div className="carousel-viewport">
								{/* Pass the URL to your ModelViewer so it loads the correct 3D asset */}
								<div className="model-container">
									<ModelViewer 
										url={availableSkins[activeSkinIndex].url} 
										width={160} 
										height={160} 
									/>
								</div>
								<div className="skin-name-badge">
									{availableSkins[activeSkinIndex].name}
								</div>
							</div>

							<button type="button" className="carousel-nav-btn" onClick={handleNextSkin}>
								▶
							</button>
						</div>
					</div>
				)}

				{/* 3. METADATA */}
				<div className="input-group" style={{ marginTop: '10px' }}>
                    <label>Skin Name</label>
                    <input 
                        type="text" 
                        value={skinName}
                        onChange={(e) => setSkinName(e.target.value)}
                        placeholder="e.g., Bloody Alpha Wolf"
                        required
                        className="market-input"
                    />
                </div>
                
                <div className="input-group" style={{ marginTop: '10px' }}>
                    <label>Description</label>
                    <textarea 
                        value={skinDescription}
                        onChange={(e) => setSkinDescription(e.target.value)}
                        placeholder="A terrifying beast of the night..."
                        required
                        className="market-input"
                        rows={3}
                        style={{ resize: 'none' }}
                    />
                </div>

				{/* 4. FILE UPLOAD */}
				<div className="input-group" style={{ marginTop: '10px' }}>
					<label>Upload .JPG Texture</label>
					<div className="file-upload-wrapper">
						<input 
							type="file" 
							accept=".jpg"
							onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
							required
							className="file-input"
							id="jpg-upload"
						/>
						<label htmlFor="jpg-upload" className="file-upload-btn">
							{uploadFile ? `Selected: ${uploadFile.name}` : 'Choose .JPG File...'}
						</label>
					</div>
				</div>

				{/* 4. SUBMIT */}
				<button 
					type="submit" 
					className="action-btn update" 
					style={{ width: '100%', marginTop: '15px', backgroundColor: '#a855f7' }}
					disabled={isSubmitting || !selectedKey || !selectedSkinId || !uploadFile}
				>
					{isSubmitting ? 'Processing...' : 'Craft Custom Skin'}
				</button>
			</form>
			{msg && <div className={`msg-banner ${msg.type}`}>{msg.text}</div>}

		</div>
	);
};