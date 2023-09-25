import type { WebSocket } from 'ws';

import { gameStateSubscriberClient } from '../../../clients/redis';

export const subscribeGameHandler = async (ws: WebSocket, roomId: string) => {
  ws.channelListener = {
    channel: roomId,
    listener: message => {
      ws.send(message);
    },
  };

  await gameStateSubscriberClient.subscribe(ws.channelListener.channel, ws.channelListener.listener);
};
