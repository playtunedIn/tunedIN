import { useState } from 'react';

import { MultiplayerProvider } from '@hooks/multiplayer';
import TempCreateRoomButton from '@components/TempCreateRoomButton';
import reactLogo from '@assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import SocketStatus from '@components/common/SocketStatus';

function App() {
  const [count, setCount] = useState(0);

  return (
    <MultiplayerProvider>
      <>
        <SocketStatus />
        <TempCreateRoomButton />
        <div data-testid="app-root">
          <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank" rel="noreferrer">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <h1>Vite + React</h1>
        <div className="card">
          <a href="/login">Login with Spotify</a>
        </div>
        <div className="card">
          <button onClick={() => setCount(count => count + 1)}>count is {count}</button>
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
        <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
      </>
    </MultiplayerProvider>
  );
}

export default App;
