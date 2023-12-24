import type { WebSocket } from 'ws';

import { REDIS_ERROR_CODES } from '../../../errors';
import { gameStatePublisherClient, playerStatePublisherClient, query, ROOT_QUERY } from '../../../clients/redis';
import { publishMessageHandler, unsubscribeRoomHandler } from '../../subscribed-message-handlers';
import type { SanitizedGameState } from 'src/clients/redis/models/game-state';
import { sendResponse } from '../../../utils/websocket-response';
import { LEAVE_ROOM_ERROR_RESPONSE, LEAVE_ROOM_RESPONSE, REMOVE_PLAYER_RESPONSE } from '../../responses';
import type { GameState, PlayerRoomSession } from '../../../clients/redis/models/game-state';
import { leaveRoomPlayerTransaction, leaveRoomTransaction } from './leave-room-transaction';

export const exitRoomHandler = async (ws: WebSocket) => {

  const { userId } = ws.userToken;

  let playerSession: PlayerRoomSession;
  try {
    playerSession = await query(userId, ROOT_QUERY, playerStatePublisherClient);
  } catch (err) {
    return sendResponse(ws, LEAVE_ROOM_ERROR_RESPONSE, { errorCode: (err as Error).message });
  }

  const roomId = playerSession?.roomId;
  if (roomId) {
    return sendResponse(ws, LEAVE_ROOM_ERROR_RESPONSE, { errorCode: "Player not in any room" });
  }

  let gameState: GameState;
  try {
    gameState = await query(roomId, ROOT_QUERY, gameStatePublisherClient);
  } catch (err) {
    return sendResponse(ws, LEAVE_ROOM_ERROR_RESPONSE, { errorCode: REDIS_ERROR_CODES.COMMAND_FAILURE });
  }

  if (!gameState) {
    return sendResponse(ws, LEAVE_ROOM_ERROR_RESPONSE, { errorCode: "Room not found" });
  }

  let updatedRoomState: SanitizedGameState;
  try {
    updatedRoomState = await leaveRoomTransaction(roomId, userId);
  } catch (err) {
    return sendResponse(ws, LEAVE_ROOM_ERROR_RESPONSE, { errorCode: (err as Error).message });
  }
  try {
    await leaveRoomPlayerTransaction(userId);
  } catch (err) {
    return sendResponse(ws, LEAVE_ROOM_ERROR_RESPONSE, { errorCode: (err as Error).message });
  }


  await unsubscribeRoomHandler(ws);
  await publishMessageHandler(roomId, REMOVE_PLAYER_RESPONSE, { playerId: userId }, userId);

  sendResponse(ws, LEAVE_ROOM_RESPONSE, updatedRoomState);
};
