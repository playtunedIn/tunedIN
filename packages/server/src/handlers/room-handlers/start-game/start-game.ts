 import type { Data, WebSocket } from 'ws';

import { REDIS_ERROR_CODES, START_GAME_ERROR_CODES } from '../../../errors';
import { isValidSchema } from '../../message.validator';
import type { StartGameReq } from './start-game.validator';
import { START_GAME_SCHEMA_NAME } from './start-game.validator';
import { START_GAME_ERROR_RESPONSE, START_GAME_RESPONSE, UPDATE_ROOM_STATUS_RESPONSE } from '../../responses';
import { sendResponse } from '../../../utils/websocket-response';
import type { RedisQuery } from '../../../clients/redis';
import {
  HOST_ID_QUERY,
  PLAYERS_QUERY,
  ROOM_STATUS_QUERY,
  ROOT_QUERY,
  gameStatePublisherClient,
  queryMultiple,
} from '../../../clients/redis';
import { type PlayerState, ROOM_STATUS, type RoomStatus, type GameState } from '../../../clients/redis/models/game-state';
import { publishMessageHandler } from '../../subscribed-message-handlers';
import { getQuestionsHandler } from '../../game-handlers/question-handlers/get-questions';
import { decrypt } from '../../../utils/crypto';

const MIN_PLAYERS_TO_START = 2;

export const startGameHandler = async (ws: WebSocket, data: StartGameReq) => {
  if (!isValidSchema(data, START_GAME_SCHEMA_NAME)) {
    return sendResponse(ws, START_GAME_ERROR_RESPONSE, { errorCode: START_GAME_ERROR_CODES.INVALID_ROOM_REQ });
  }

  const { userId } = ws.userToken;
  const { roomId } = data;
  const access_token = decrypt(ws.userToken.spotifyToken);
  const token_1 = ws.userToken.refresh;
  
  const user = {
    name: ws.userToken.name,
    token: access_token ? access_token : 'default_value'
  };

  let response: Record<RedisQuery, unknown>;
  try {
    response = await queryMultiple(roomId, [ROOT_QUERY, HOST_ID_QUERY, ROOM_STATUS_QUERY, PLAYERS_QUERY], gameStatePublisherClient);
  } catch (err) {
    return sendResponse(ws, START_GAME_ERROR_RESPONSE, { errorCode: (err as Error).message });
  }

  const roomState = response[ROOT_QUERY] as GameState;
  const hostId = response[HOST_ID_QUERY] as string;
  const roomStatus = response[ROOM_STATUS_QUERY] as RoomStatus;
  const players = response[PLAYERS_QUERY] as PlayerState[];

  if (userId !== hostId) {
    return sendResponse(ws, START_GAME_ERROR_RESPONSE, { errorCode: START_GAME_ERROR_CODES.NOT_HOST });
  }

  if (roomStatus !== ROOM_STATUS.LOBBY) {
    return sendResponse(ws, START_GAME_ERROR_RESPONSE, { errorCode: START_GAME_ERROR_CODES.ROOM_NOT_IN_LOBBY });
  }

  if (players.length < MIN_PLAYERS_TO_START) {
    return sendResponse(ws, START_GAME_ERROR_RESPONSE, { errorCode: START_GAME_ERROR_CODES.NOT_ENOUGH_PLAYERS });
  }

  try {
    await gameStatePublisherClient.json.set(roomId, ROOM_STATUS_QUERY, ROOM_STATUS.LOADING_GAME);
  } catch {
    return sendResponse(ws, START_GAME_ERROR_RESPONSE, { errorCode: REDIS_ERROR_CODES.COMMAND_FAILURE });
  }

  await publishMessageHandler(roomId, UPDATE_ROOM_STATUS_RESPONSE, {
    roomStatus: ROOM_STATUS.LOADING_GAME,
  });

  try {
    await getQuestionsHandler(roomId, user);
  } catch {
    return sendResponse(ws, START_GAME_ERROR_RESPONSE, { errorCode: START_GAME_ERROR_CODES.GET_QUESTIONS_FAILED });
  }

  sendResponse(ws, START_GAME_RESPONSE, roomState);
};