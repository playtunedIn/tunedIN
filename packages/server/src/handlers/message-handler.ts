import { WebSocket } from 'ws';

import { SocketMessage, messageHandlers } from './models/handlers';

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
