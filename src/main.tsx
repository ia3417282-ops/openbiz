/**
 * OpenBiz PWA
 * Developed & Owned by: Johannes Youn (يوهانس يون)
 * Copyright © 2026 All Rights Reserved.
 */
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
