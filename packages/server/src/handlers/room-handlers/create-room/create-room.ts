import type { RedisJSON } from '@redis/json/dist/commands';
import type { WebSocket } from 'ws';

import { sendResponse } from '../../../utils/websocket-response';
import { CREATE_ROOM_ERROR_RESPONSE, CREATE_ROOM_RESPONSE } from '../../responses';
import { ROOT_QUERY, gameStatePublisherClient } from '../../../clients/redis';
import { generateDefaultGameState, generateUniqueRoomId } from '../../../utils/room-helpers';
import { REDIS_ERROR_CODES, CREATE_ROOM_ERROR_CODES } from '../../../errors';
import { storePlayerDetailsHandler } from '../../game-handlers/player-handlers/store-player-handler/store-player-handler';

export const createRoomHandler = async (ws: WebSocket) => {
  const roomId = generateUniqueRoomId();
  const hostId = ws.userToken.userId;
  const hostName = ws.userToken.name;
  let roomExists: boolean;
  try {
    roomExists = (await gameStatePublisherClient.exists(roomId)) > 0;
  } catch {
    return sendResponse(ws, CREATE_ROOM_ERROR_RESPONSE, { errorCode: REDIS_ERROR_CODES.COMMAND_FAILURE });
  }

  if (roomExists) {
    return sendResponse(ws, CREATE_ROOM_ERROR_RESPONSE, { errorCode: CREATE_ROOM_ERROR_CODES.GENERATE_ID_ERROR });
  }

  const defaultGameStateJson = generateDefaultGameState(roomId, hostId, hostName);

  try {
    await gameStatePublisherClient.json.set(roomId, ROOT_QUERY, defaultGameStateJson as unknown as RedisJSON);
  } catch {
    return sendResponse(ws, CREATE_ROOM_ERROR_RESPONSE, { errorCode: REDIS_ERROR_CODES.COMMAND_FAILURE });
  }

  try {
    await storePlayerDetailsHandler(ws);
  } catch {
    return sendResponse(ws, CREATE_ROOM_ERROR_RESPONSE, {
      errorCode: CREATE_ROOM_ERROR_CODES.STORE_PLAYER_TOKEN_HANDLER_FAILED,
    });
  }
  sendResponse(ws, CREATE_ROOM_RESPONSE, defaultGameStateJson);
};
