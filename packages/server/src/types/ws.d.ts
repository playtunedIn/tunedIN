import ws from 'ws';

declare module 'ws' {
  export interface WebSocket extends ws {
    channelListener?: {
      channel: string;
      listener: (message: string) => void;
    };
  }
}
