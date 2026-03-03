import React, { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Register: React.FC = () => {
    const { theme } = useTheme();
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // No need to manually listen for LOGIN_SUCCESS here to call login(),
    // because AuthContext does it globally and will update isAuthenticated.
    // Dashboard will then re-render and remove this component.

    return (
        <iframe 
            ref={iframeRef}
            src={`register.html?theme=${theme}`}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Register"
            className="auth-subbox-frame"
        />
    );
};

export default Register;
