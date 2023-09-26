import type { WebSocket } from 'ws';

import { REDIS_ERROR_CODES, START_GAME_ERROR_CODES } from '../../../errors';
import { isValidSchema } from '../../message.validator';
import type { StartGameReq } from './start-game.validator';
import { START_GAME_SCHEMA_NAME } from './start-game.validator';
import { START_GAME_ERROR_RESPONSE, UPDATE_ROOM_STATUS_RESPONSE } from '../../responses';
import { sendResponse } from '../../../utils/websocket-response';
import type { RedisQuery } from '../../../clients/redis';
import { HOST_ID_QUERY, ROOM_STATUS_QUERY, gameStatePublisherClient, queryMultiple } from '../../../clients/redis';
import { ROOM_STATUS, type RoomStatus } from '../../../clients/redis/models/game-state';
import { publishMessageHandler } from '../../subscribed-message-handlers';
import { getQuestionsHandler } from '../../game-handlers/question-handlers/get-questions';

export const startGameHandler = async (ws: WebSocket, data: StartGameReq) => {
  if (!isValidSchema(data, START_GAME_SCHEMA_NAME)) {
    return sendResponse(ws, START_GAME_ERROR_RESPONSE, { errorCode: START_GAME_ERROR_CODES.INVALID_ROOM_REQ });
  }

  const { userId } = ws.userToken;
  const { roomId } = data;

  let response: Record<RedisQuery, unknown>;
  try {
    response = await queryMultiple(roomId, [HOST_ID_QUERY, ROOM_STATUS_QUERY], gameStatePublisherClient);
  } catch (err) {
    return sendResponse(ws, START_GAME_ERROR_RESPONSE, { errorCode: (err as Error).message });
  }

  const hostId = response[HOST_ID_QUERY] as string;
  const roomStatus = response[ROOM_STATUS_QUERY] as RoomStatus;

  if (userId !== hostId) {
    return sendResponse(ws, START_GAME_ERROR_RESPONSE, { errorCode: START_GAME_ERROR_CODES.NOT_HOST });
  }

  if (roomStatus !== ROOM_STATUS.LOBBY) {
    return sendResponse(ws, START_GAME_ERROR_RESPONSE, { errorCode: START_GAME_ERROR_CODES.ROOM_NOT_IN_LOBBY });
  }

  try {
    await gameStatePublisherClient.json.set(roomId, ROOM_STATUS_QUERY, ROOM_STATUS.LOADING_GAME);
  } catch {
    return sendResponse(ws, START_GAME_ERROR_RESPONSE, { errorCode: REDIS_ERROR_CODES.COMMAND_FAILURE });
  }

  await publishMessageHandler(roomId, UPDATE_ROOM_STATUS_RESPONSE, {
    roomStatus: ROOM_STATUS.LOADING_GAME,
  });

  getQuestionsHandler(roomId);
};
