import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './layout.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  // strict mode causes useEffect to run twice in dev mode
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
