// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Import your App component
import './index.css'; // This is typically where your global styles, including Tailwind's base styles, are imported.

// Get the root HTML element where your React app will be mounted
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

// Render your App component into the root element
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);