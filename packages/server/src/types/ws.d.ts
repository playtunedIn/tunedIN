import type ws from 'ws';

declare module 'ws' {
  export interface WebSocket extends ws {
    channelListener?: {
      channel: string;
      listener: (message: string) => void;
    };
  }


  // export interface IncomingMessage {
  //   user?: TunedInJwtPayload;
  // }
}

export {}