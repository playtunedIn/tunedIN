import { WebSocket } from 'ws';

import { unsubscribeChannel } from '../../../clients/redis/redis-client';

export const unsubscribeRoomHandler = async (ws: WebSocket) => {
  if (ws.channelListener) {
    await unsubscribeChannel(ws.channelListener);
    ws.send('unsubscribed');
  }
};
