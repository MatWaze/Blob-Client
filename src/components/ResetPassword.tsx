import React, { useState } from 'react';

interface Props {
    token: string;
    // onSuccess: () => void;
}

const ResetPassword: React.FC<Props> = ({ token }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const serverUrl = import.meta.env.VITE_SERVER_URL;

    const cleanError = (msg: string) => {
        // Removes "body/password " or "body/email " from the start
        return msg.replace(/^(body|params|querystring)\/[a-zA-Z0-9_]+\s?/, '');
    };

    // New helper to clear errors on input
    const handleInputChange = (
        setter: React.Dispatch<React.SetStateAction<string>>, 
        value: string
    ) => {
        setter(value);
        if (status === 'error') {
            setStatus('idle');
            setMessage('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setStatus('error');
            setMessage("Passwords do not match");
            return;
        }

        setStatus('loading');
        
        try {
            const res = await fetch(`${serverUrl}/api/users/password/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                setStatus('error');
                setMessage(cleanError(data.message || 'Reset failed'));
            }
        } catch (err) {
            setStatus('error');
            setMessage('Network connection error');
        }
    };

    const toggleBtnStyle: React.CSSProperties = {
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        opacity: 0.7,
        zIndex: 10
    };

    return (
        <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ fontSize: '40px', textAlign: 'center', marginBottom: '20px', color: 'var(--text-primary)' }}>
                Set New Password
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                {/* Password Field */}
                <div style={{ position: 'relative' }}>
                    <input 
                        type={showPassword ? "text" : "password"}
                        placeholder="New Password" 
                        value={password}
                        onChange={e => handleInputChange(setPassword, e.target.value)}
                        required
                        minLength={8}
                        style={{ width: '100%', paddingRight: '40px' }}
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={toggleBtnStyle}
                        title={showPassword ? "Hide password" : "Show password"}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {showPassword ? (
                                // Open Eye (Visible)
                                <path d="M12 5C7 5 2.73 8.11 1 12.5C2.73 16.89 7 20 12 20C17 20 21.27 16.89 23 12.5C21.27 8.11 17 5 12 5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" fill="currentColor"/>
                            ) : (
                                // Closed Eye (Hidden)
                                <path d="M12 7C14.76 7 17 9.24 17 12C17 12.65 16.87 13.26 16.64 13.83L19.56 16.75C21.07 15.49 22.26 13.86 22.99 12C21.26 7.61 16.99 4.5 11.99 4.5C10.59 4.5 9.25 4.75 8.01 5.2L10.17 7.36C10.74 7.13 11.35 7 12 7ZM2 4.27L4.28 6.55L4.74 7.01C3.08 8.3 1.78 10.02 1 12C2.73 16.39 7 19.5 12 19.5C13.55 19.5 15.03 19.2 16.38 18.66L16.8 19.08L19.73 22L21 20.73L3.27 3M7.53 9.8L9.08 11.35C9.03 11.56 9 11.78 9 12C9 13.66 10.34 15 12 15C12.22 15 12.44 14.97 12.65 14.92L14.2 16.47C13.53 16.8 12.79 17 12 17C9.24 17 7 14.76 7 12C7 11.21 7.2 10.47 7.53 9.8ZM11.84 9.02L14.99 12.17L15.01 11.99C15.01 10.33 13.67 8.99 12.01 8.99L11.84 9.02Z" fill="currentColor"/>
                            )}
                        </svg>
                    </button>
                </div>

                {/* Confirm Password Field */}
                <div style={{ position: 'relative' }}>
                    <input 
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password" 
                        value={confirmPassword}
                        onChange={e => handleInputChange(setConfirmPassword, e.target.value)}
                        required
                        style={{ width: '100%', paddingRight: '40px' }}
                    />
                    <button 
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={toggleBtnStyle}
                        title={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {showConfirmPassword ? (
                                <path d="M12 5C7 5 2.73 8.11 1 12.5C2.73 16.89 7 20 12 20C17 20 21.27 16.89 23 12.5C21.27 8.11 17 5 12 5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" fill="currentColor"/>
                            ) : (
                                <path d="M12 7C14.76 7 17 9.24 17 12C17 12.65 16.87 13.26 16.64 13.83L19.56 16.75C21.07 15.49 22.26 13.86 22.99 12C21.26 7.61 16.99 4.5 11.99 4.5C10.59 4.5 9.25 4.75 8.01 5.2L10.17 7.36C10.74 7.13 11.35 7 12 7ZM2 4.27L4.28 6.55L4.74 7.01C3.08 8.3 1.78 10.02 1 12C2.73 16.39 7 19.5 12 19.5C13.55 19.5 15.03 19.2 16.38 18.66L16.8 19.08L19.73 22L21 20.73L3.27 3M7.53 9.8L9.08 11.35C9.03 11.56 9 11.78 9 12C9 13.66 10.34 15 12 15C12.22 15 12.44 14.97 12.65 14.92L14.2 16.47C13.53 16.8 12.79 17 12 17C9.24 17 7 14.76 7 12C7 11.21 7.2 10.47 7.53 9.8ZM11.84 9.02L14.99 12.17L15.01 11.99C15.01 10.33 13.67 8.99 12.01 8.99L11.84 9.02Z" fill="currentColor"/>
                            )}
                        </svg>
                    </button>
                </div>

                <button type="submit" className="action-btn" disabled={status === 'loading'}>
                    {status === 'loading' ? 'Updating...' : 'Update Password'}
                </button>
                
                {status === 'error' && (
                    <div style={{ 
                        color: '#ef4444', 
                        fontSize: '13px', 
                        textAlign: 'center',
                        background: 'rgba(239, 68, 68, 0.1)',
                        padding: '10px',
                        borderRadius: '4px',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        marginTop: '5px'
                    }}>
                        {message}
                    </div>
                )}
            </form>
        </div>
    );
};

export default ResetPassword;