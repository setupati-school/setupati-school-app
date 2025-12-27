import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// Initialize PWA functionality
import './lib/pwa';

// Run PWA foundation tests in development
if (import.meta.env.DEV) {
  import('./utils/pwa-test');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
