import type { WebSocket } from 'ws';

import type { RedisJSON } from '@redis/json/dist/commands';

import type { GameState, PlayerRoomSession } from '../../../clients/redis/models/game-state';
import { gameStatePublisherClient, playerStatePublisherClient } from '../../../clients/redis';
import { sendResponse } from '../../../utils/websocket-response';
import { subscribeRoomHandler } from '../../subscribed-message-handlers';
import { RECOVER_ROOM_SESSION_ERROR_RESPONSE, RECOVER_ROOM_SESSION_RESPONSE } from '../../room-handlers/types/response';
import { REDIS_ERROR_CODES } from '../../../errors';

export const recoverRoomSessionHandler = async (ws: WebSocket) => {
  let playerSessionResponse: RedisJSON[];
  try {
    playerSessionResponse = (await playerStatePublisherClient.json.get(ws.userToken.userId)) as RedisJSON[];
  } catch {
    return sendResponse(ws, RECOVER_ROOM_SESSION_ERROR_RESPONSE, { errorCode: REDIS_ERROR_CODES.COMMAND_FAILURE });
  }

  if (playerSessionResponse[0] === null) {
    return sendResponse(ws, RECOVER_ROOM_SESSION_ERROR_RESPONSE, { errorCode: REDIS_ERROR_CODES.KEY_NOT_FOUND });
  }
  const playerSession = playerSessionResponse[0] as unknown as PlayerRoomSession;

  let gameStateResponse: RedisJSON[];
  try {
    gameStateResponse = (await gameStatePublisherClient.json.get(playerSession.roomId)) as RedisJSON[];
  } catch {
    return sendResponse(ws, RECOVER_ROOM_SESSION_ERROR_RESPONSE, { errorCode: REDIS_ERROR_CODES.COMMAND_FAILURE });
  }

  if (gameStateResponse[0] === null) {
    return sendResponse(ws, RECOVER_ROOM_SESSION_ERROR_RESPONSE, { errorCode: REDIS_ERROR_CODES.KEY_NOT_FOUND });
  }
  const gameState = gameStateResponse[0] as unknown as GameState;

  await subscribeRoomHandler(ws, gameState.roomId);
  sendResponse(ws, RECOVER_ROOM_SESSION_RESPONSE, { state: gameState });
};
