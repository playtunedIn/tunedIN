import type { WebSocket } from 'ws';

import type { GameState, PlayerRoomSession } from '../../../clients/redis/models/game-state';
import { ROOT_QUERY, gameStatePublisherClient, playerStatePublisherClient, query } from '../../../clients/redis';
import { sendResponse } from '../../../utils/websocket-response';
import { subscribeRoomHandler } from '../../subscribed-message-handlers';
import { RECOVER_ROOM_SESSION_ERROR_RESPONSE, RECOVER_ROOM_SESSION_RESPONSE } from '../../responses';

export const recoverRoomSessionHandler = async (ws: WebSocket) => {
  const { userId } = ws.userToken;

  let playerSession: PlayerRoomSession;
  try {
    playerSession = await query(userId, ROOT_QUERY, playerStatePublisherClient);
  } catch (err) {
    return sendResponse(ws, RECOVER_ROOM_SESSION_ERROR_RESPONSE, { errorCode: (err as Error).message });
  }

  let gameState: GameState;
  try {
    gameState = await query(playerSession.roomId, ROOT_QUERY, gameStatePublisherClient);
  } catch (err) {
    return sendResponse(ws, RECOVER_ROOM_SESSION_ERROR_RESPONSE, { errorCode: (err as Error).message });
  }

  await subscribeRoomHandler(ws, gameState.roomId);
  sendResponse(ws, RECOVER_ROOM_SESSION_RESPONSE, { state: gameState });
};
