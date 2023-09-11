import type { WebSocket } from 'ws';

import type { SocketMessage } from '../models/handlers';
import { messageHandlers } from '../models/handlers';

export const heartbeat = (ws: WebSocket) => {
  ws.isAlive = true;
};

export const messageHandler = (ws: WebSocket, dataStr: string) => {
  let data: SocketMessage;
  try {
    data = JSON.parse(dataStr);
  } catch (err) {
    return ws.send('Invalid Command');
  }

  if (messageHandlers[data.type]) {
    messageHandlers[data.type](ws, data.data);
  }
};
