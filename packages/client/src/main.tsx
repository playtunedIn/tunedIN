import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Router from './routes';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <Router />
  </StrictMode>
);
