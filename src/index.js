import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Global error handler to suppress Monday.com SDK internal errors
window.addEventListener('error', (event) => {
  // Suppress Monday.com SDK translation service errors (non-critical)
  if (event.error && (
    event.error.message?.includes('translationsService') ||
    event.error.message?.includes('Cannot read properties of undefined')
  )) {
    event.preventDefault();
    // Silently ignore - this is a Monday.com SDK internal issue
    return false;
  }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  // Suppress Monday.com SDK related promise rejections
  if (event.reason && (
    event.reason.message?.includes('translationsService') ||
    event.reason.message?.includes('Cannot read properties of undefined')
  )) {
    event.preventDefault();
    // Silently ignore - this is a Monday.com SDK internal issue
    return false;
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
