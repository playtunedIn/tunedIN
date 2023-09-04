import type ws from 'ws';

import type { TunedInJwtPayload } from '../utils/auth';

declare module 'ws' {
  export interface WebSocket extends ws {
    userToken: TunedInJwtPayload;
    channelListener?: {
      channel: string;
      listener: (message: string) => void;
    };
    isAlive: boolean;
  }
}
