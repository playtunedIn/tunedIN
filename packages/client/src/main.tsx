import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import { setupStore } from '@store/store';
import './index.css';
import Router from './routes';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <Provider store={setupStore()}>
      <Router />
    </Provider>
  </StrictMode>
);
