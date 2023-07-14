import { WebSocket } from 'ws';

import { subscribeChannel } from '../../../clients/redis/redis-client';

export const subscribeGameHandler = async (ws: WebSocket, roomId: string) => {
  ws.channelListener = {
    channel: roomId,
    listener: message => {
      ws.send(message);
    },
  };

  await subscribeChannel(ws.channelListener);
};
