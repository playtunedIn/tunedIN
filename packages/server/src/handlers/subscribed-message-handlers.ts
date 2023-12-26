import type { WebSocket } from 'ws';

import { gameStatePublisherClient, gameStateSubscriberClient } from '../clients/redis';
import { type SubscribedMessagePayload, type SubscribedMessageHandlerResponse, SUBSCRIBED_RESPONSE } from './responses';
import { sendResponse } from '../utils/websocket-response';
import { REDIS_ERROR_CODES } from '../errors';

export const publishMessageHandler = async (
  roomId: string,
  type: SubscribedMessageHandlerResponse,
  data: Record<string, unknown>,
  userId?: string
) => {
  const payload: SubscribedMessagePayload = {
    userId,
    type,
    data,
  };

  let payloadStr: string;
  try {
    payloadStr = JSON.stringify(payload);
  } catch {
    throw new Error(REDIS_ERROR_CODES.CORRUPT_STRINGIFY);
  }

  return gameStatePublisherClient.publish(roomId, payloadStr);
};

export const subscribeRoomHandler = async (ws: WebSocket, roomId: string) => {
  ws.channelListener = {
    channel: roomId,
    listener: message => {
      let payload: SubscribedMessagePayload;
      try {
        payload = JSON.parse(message) as SubscribedMessagePayload;
      } catch {
        // TODO: Add logging here
        console.log(REDIS_ERROR_CODES.CORRUPT_JSON_PARSE);
        return;
      }

      // Don't forward userId to frontend
      const { userId, ...formattedPayload } = payload;
      if (userId !== ws.userToken.userId) {
        sendResponse(ws, SUBSCRIBED_RESPONSE, formattedPayload);
      }
    },
  };

  return gameStateSubscriberClient.subscribe(ws.channelListener.channel, ws.channelListener.listener);
};

export const unsubscribeRoomHandler = async (ws: WebSocket) => {
  if (ws.channelListener) {
    await gameStateSubscriberClient.unsubscribe(ws.channelListener.channel, ws.channelListener.listener);
    // TODO: This send may be unnecessary but leaving it for now
    ws.send(JSON.stringify({ type: 'unsubscribed' }));
  }
};
