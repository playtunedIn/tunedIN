import { WebSocket } from 'ws';

import { SocketMessage, messageHandlers } from './models/handlers';

export const messageHandler = (ws: WebSocket, dataStr: string) => {
  const data = JSON.parse(dataStr) as SocketMessage;

  if (messageHandlers[data.type]) {
    messageHandlers[data.type](ws, data.data);
  }
};
