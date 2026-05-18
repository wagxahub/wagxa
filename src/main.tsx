import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './styles/index.css';

// Suppress crypto wallet extension errors
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args: any[]) => {
  const message = args[0]?.toString() || '';
  if (
    message.includes('MetaMask') ||
    message.includes('ethereum') ||
    message.includes('web3') ||
    message.includes('Failed to connect') ||
    message.includes('wallet')
  ) {
    return;
  }
  originalError.apply(console, args);
};

console.warn = (...args: any[]) => {
  const message = args[0]?.toString() || '';
  if (
    message.includes('MetaMask') ||
    message.includes('ethereum') ||
    message.includes('web3') ||
    message.includes('wallet')
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
