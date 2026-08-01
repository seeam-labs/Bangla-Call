/// <reference types="vite/client" />
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import { ToastProvider } from './components/Toast.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

if ('serviceWorker' in navigator) {
  if (process.env.NODE_ENV !== 'production') {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  } else {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ToastProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </ToastProvider>
    </HelmetProvider>
  </StrictMode>,
);
