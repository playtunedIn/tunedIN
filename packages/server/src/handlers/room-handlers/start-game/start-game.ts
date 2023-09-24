import type { WebSocket } from 'ws';

import { REDIS_ERROR_CODES, START_GAME_ERROR_CODES } from '../../../errors';
import { isValidSchema } from '../../message.validator';
import type { StartGameReq } from './start-game.validator';
import { START_GAME_SCHEMA_NAME } from './start-game.validator';
import { START_GAME_ERROR_RESPONSE, UPDATE_ROOM_STATUS_RESPONSE } from '../../responses';
import { sendResponse } from '../../../utils/websocket-response';
import { gameStatePublisherClient } from '../../../clients/redis';
import { ROOM_STATUS, type RoomStatus } from '../../../clients/redis/models/game-state';
import { publishMessageHandler } from '../../subscribed-message-handlers';
import { getQuestionsHandler } from '../../game-handlers/question-handlers/get-questions';

export const startGameHandler = async (ws: WebSocket, data: StartGameReq) => {
  if (!isValidSchema(data, START_GAME_SCHEMA_NAME)) {
    return sendResponse(ws, START_GAME_ERROR_RESPONSE, { errorCode: START_GAME_ERROR_CODES.INVALID_ROOM_REQ });
  }

  const { userId } = ws.userToken;
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

  if (response[hostIdQuery]?.[0] === null || response[roomStatusQuery]?.[0] === null) {
    return sendResponse(ws, START_GAME_ERROR_RESPONSE, { errorCode: REDIS_ERROR_CODES.KEY_NOT_FOUND });
  }

  const hostId = response[hostIdQuery][0] as string;
  const roomStatus = response[roomStatusQuery][0] as RoomStatus;

  if (userId !== hostId) {
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

  await publishMessageHandler(roomId, UPDATE_ROOM_STATUS_RESPONSE, {
    roomStatus: ROOM_STATUS.LOADING_GAME,
  });

  getQuestionsHandler(roomId);
};
