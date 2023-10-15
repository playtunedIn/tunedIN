
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { setupStore } from '../src/store/store';
import App from "../src/App";

createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
      <Provider store={setupStore()}>
        <App />
      </Provider>
    </StrictMode>
  );
