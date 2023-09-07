import type { WebSocket } from 'ws';

import type { GameState, PlayerRoomSession } from '../../../clients/redis/models/game-state';
import { gameStatePublisherClient, playerStatePublisherClient } from '../../../clients/redis';
import { sendResponse } from '../../../utils/websocket-response';
import { subscribeGameHandler } from '../../game-handlers/subscribe-game/subscribe-game';
import { RECOVER_ROOM_SESSION_ERROR_RESPONSE, RECOVER_ROOM_SESSION_RESPONSE } from '../../room-handlers/types/response';
import { RECOVER_ROOM_SESSION_ERROR_CODES } from './recover-room-session.errors';

export const recoverRoomSessionHandler = async (ws: WebSocket) => {
  let playerRoomStateStr: string | null;
  try {
    playerRoomStateStr = await playerStatePublisherClient.get(ws.userToken.userId);
  } catch (err) {
    return sendResponse(ws, RECOVER_ROOM_SESSION_ERROR_RESPONSE, {
      errorCode: RECOVER_ROOM_SESSION_ERROR_CODES.PLAYER_SESSION_REQ_FAILED,
    });
  }

  if (!playerRoomStateStr) {
    return sendResponse(ws, RECOVER_ROOM_SESSION_ERROR_RESPONSE, {
      errorCode: RECOVER_ROOM_SESSION_ERROR_CODES.PLAYER_SESSION_NOT_FOUND,
    });
  }

  let playerRoomState: PlayerRoomSession;
  try {
    playerRoomState = JSON.parse(playerRoomStateStr);
  } catch (err) {
    return sendResponse(ws, RECOVER_ROOM_SESSION_ERROR_RESPONSE, {
      errorCode: RECOVER_ROOM_SESSION_ERROR_CODES.CORRUPT_PLAYER_SESSION,
    });
  }

  let gameStateStr: string | null;
  try {
    gameStateStr = await gameStatePublisherClient.get(playerRoomState.roomId);
  } catch (err) {
    return sendResponse(ws, RECOVER_ROOM_SESSION_ERROR_RESPONSE, {
      errorCode: RECOVER_ROOM_SESSION_ERROR_CODES.GAME_STATE_REQ_FAILED,
    });
  }

  if (!gameStateStr) {
    return sendResponse(ws, RECOVER_ROOM_SESSION_ERROR_RESPONSE, {
      errorCode: RECOVER_ROOM_SESSION_ERROR_CODES.GAME_STATE_NOT_FOUND,
    });
  }

  let gameState: GameState;
  try {
    gameState = JSON.parse(gameStateStr);
  } catch (err) {
    return sendResponse(ws, RECOVER_ROOM_SESSION_ERROR_RESPONSE, {
      errorCode: RECOVER_ROOM_SESSION_ERROR_CODES.CORRUPT_GAME_STATE,
    });
  }

  sendResponse(ws, RECOVER_ROOM_SESSION_RESPONSE, { state: gameState });
  await subscribeGameHandler(ws, playerRoomState.roomId);
};
