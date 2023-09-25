import type { WebSocket } from 'ws';

import { gameStateSubscriberClient } from '../../../clients/redis';

export const unsubscribeRoomHandler = async (ws: WebSocket) => {
  if (ws.channelListener) {
    await gameStateSubscriberClient.unsubscribe(ws.channelListener.channel, ws.channelListener.listener);
    ws.send('unsubscribed');
  }
};
