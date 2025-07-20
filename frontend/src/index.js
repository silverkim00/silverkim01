import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 🔥 Service Worker 등록 (여기 추가!)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker 등록 성공:', registration);
      })
      .catch((registrationError) => {
        console.log('❌ Service Worker 등록 실패:', registrationError);
      });
  });
}