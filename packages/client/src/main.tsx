import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Router from './routes';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <Router />
  </StrictMode>
);
