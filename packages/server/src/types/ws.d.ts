import type ws from 'ws';

declare module 'ws' {
  export interface WebSocket extends ws {
    channelListener?: {
      channel: string;
      listener: (message: string) => void;
    };
    isAlive: boolean;
  }
}
