import React, { useState } from 'react';
import SubBox from './SubBox';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const serverUrl = import.meta.env.VITE_SERVER_URL;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        
        try {
            // Note: Using the endpoint you defined
            const res = await fetch(`${serverUrl}/api/users/password/request-reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();
            
            // We usually show success even if email doesn't exist for security, 
            // but here we trust the API response
            if (res.ok) {
                setStatus('success');
            } else {
                setStatus('error');
                setMessage(data.message || 'Failed to send request');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Network error');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            {status === 'success' ? (
                <div style={{ textAlign: 'center', color: '#4ade80' }}>
                    <h3>Email Sent!</h3>
                    <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>
                        Check your inbox for a link to reset your password.
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                    <input 
                        type="email" 
                        placeholder="Email address"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        disabled={status === 'loading'}
                    />
                    <button type="submit" className="action-btn" disabled={status === 'loading'}>
                        {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
                    </button>
                    {status === 'error' && (
                        <p style={{ color: '#ef4444', fontSize: '12px', textAlign: 'center' }}>
                            {message}
                        </p>
                    )}
                </form>
            )}
        </div>
    );
};

export default ForgotPassword;