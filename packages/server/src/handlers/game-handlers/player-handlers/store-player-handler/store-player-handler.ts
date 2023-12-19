import type { RedisJSON } from '@redis/json/dist/commands';
import type { WebSocket } from 'ws';

import { ROOT_QUERY, playerStatePublisherClient } from '../../../../clients/redis';
import { sendResponse } from '../../../../utils/websocket-response';
import { REDIS_ERROR_CODES } from '../../../../errors';
import { PLAYER_HANDLER_ERROR_RESPONSE } from '../../../responses';

export const storePlayerDetailsHandler = async (ws: WebSocket) => {
  try {
    await playerStatePublisherClient.json.set(ws.userToken.userId, ROOT_QUERY, ws.userToken as unknown as RedisJSON);
  } catch {
    sendResponse(ws, PLAYER_HANDLER_ERROR_RESPONSE, { errorCode: REDIS_ERROR_CODES.STORE_PLAYER_TOKEN_FAILURE });
  }
};
