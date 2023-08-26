import type { WebSocket } from 'ws';

import { gameStateSubscriberClient } from '../../../clients/redis';

export const unsubscribeRoomHandler = async (ws: WebSocket) => {
  if (ws.channelListener) {
    await gameStateSubscriberClient.unsubscribeFromChanges(ws.channelListener);
    ws.send('unsubscribed');
  }
};
