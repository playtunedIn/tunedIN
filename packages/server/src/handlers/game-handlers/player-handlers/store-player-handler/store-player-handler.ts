import type { RedisJSON } from '@redis/json/dist/commands';
import type { WebSocket } from 'ws';

import { ROOT_QUERY, playerStatePublisherClient } from '../../../../clients/redis';
import { sendResponse } from '../../../../utils/websocket-response';
import { REDIS_ERROR_CODES } from '../../../../errors';
import { PLAYER_HANDLER_ERROR_RESPONSE } from '../../../responses';
import { generateDefaultTokenState } from '../../../../utils/room-helpers';

export const storePlayerDetailsHandler = async (roomId: string, ws: WebSocket) => {
  const tokenState = generateDefaultTokenState(roomId, ws);
  try {
    await playerStatePublisherClient.json.set(ws.userToken.userId, ROOT_QUERY, tokenState as unknown as RedisJSON);
  } catch {
    sendResponse(ws, PLAYER_HANDLER_ERROR_RESPONSE, { errorCode: REDIS_ERROR_CODES.STORE_PLAYER_TOKEN_FAILURE });
  }
};
