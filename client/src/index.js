import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import axios from 'axios';
import './index.css';
import './styles.css';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);