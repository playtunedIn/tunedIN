import { ReactElement } from 'react';
import { MultiplayerProvider } from '@hooks/multiplayer';

export const multiplayerProviderWrapper = ({ children }: { children: ReactElement }) => (
  <MultiplayerProvider>{children}</MultiplayerProvider>
);
