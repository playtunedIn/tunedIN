import type { WebSocket } from 'ws';

import { REDIS_ERROR_CODES, START_GAME_ERROR_CODES } from '../../../errors';
import { isValidSchema } from '../../message.validator';
import type { StartGameReq } from './start-game.validator';
import { START_GAME_SCHEMA_NAME } from './start-game.validator';
import { START_GAME_ERROR_RESPONSE, START_GAME_RESPONSE } from '../types/response';
import { sendResponse } from '../../../utils/websocket-response';
import { gameStatePublisherClient } from '../../../clients/redis';
import { ROOM_STATUS, type RoomStatus } from '../../../clients/redis/models/game-state';

export const startGameHandler = async (ws: WebSocket, data: StartGameReq) => {
  if (!isValidSchema(data, START_GAME_SCHEMA_NAME)) {
    return sendResponse(ws, START_GAME_ERROR_RESPONSE, { errorCode: START_GAME_ERROR_CODES.INVALID_ROOM_REQ });
  }

  const { roomId } = data;

  const hostIdQuery = '$.hostId';
  const roomStatusQuery = '$.roomStatus';

  let response: Record<string, unknown[]>;
  try {
    response = (await gameStatePublisherClient.json.get(roomId, {
      path: [hostIdQuery, roomStatusQuery],
    })) as Record<string, unknown[]>;
  } catch {
    return sendResponse(ws, START_GAME_ERROR_RESPONSE, { errorCode: REDIS_ERROR_CODES.COMMAND_FAILURE });
  }

  if (!response[hostIdQuery]?.[0] || !response[roomStatusQuery]?.[0]) {
    return sendResponse(ws, START_GAME_ERROR_RESPONSE, { errorCode: REDIS_ERROR_CODES.KEY_NOT_FOUND });
  }

  const hostId = response[hostIdQuery][0] as string;
  const roomStatus = response[roomStatusQuery][0] as RoomStatus;

  if (ws.userToken.userId !== hostId) {
    return sendResponse(ws, START_GAME_ERROR_RESPONSE, { errorCode: START_GAME_ERROR_CODES.NOT_HOST });
  }

  if (roomStatus !== ROOM_STATUS.LOBBY) {
    return sendResponse(ws, START_GAME_ERROR_RESPONSE, { errorCode: START_GAME_ERROR_CODES.ROOM_NOT_IN_LOBBY });
  }

  try {
    await gameStatePublisherClient.json.set(roomId, roomStatusQuery, ROOM_STATUS.LOADING_GAME);
  } catch {
    return sendResponse(ws, START_GAME_ERROR_RESPONSE, { errorCode: REDIS_ERROR_CODES.COMMAND_FAILURE });
  }

  sendResponse(ws, START_GAME_RESPONSE, { roomStatus: ROOM_STATUS.LOADING_GAME });
};
