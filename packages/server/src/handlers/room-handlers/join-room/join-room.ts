import type { WebSocket } from 'ws';

import { JOIN_ROOM_ERROR_CODES, REDIS_ERROR_CODES } from '../../../errors';
import { gameStatePublisherClient } from '../../../clients/redis';
import { isValidSchema } from '../../message.validator';
import { publishMessageHandler, subscribeRoomHandler } from '../../subscribed-message-handlers';
import type { JoinRoomReq } from './join-room.validator';
import { JOIN_ROOM_SCHEMA_NAME } from './join-room.validator';
import type { SanitizedGameState } from 'src/clients/redis/models/game-state';
import { storePlayerDetailsHandler } from '../../game-handlers/player-handlers/store-player-handler/store-player-handler';
import { sendResponse } from '../../../utils/websocket-response';
import { ADD_PLAYER_RESPONSE, JOIN_ROOM_ERROR_RESPONSE, JOIN_ROOM_RESPONSE } from '../../responses';
import { createNewPlayerState } from '../../../utils/room-helpers';
import { joinRoomTransaction } from './join-room-transaction';

export const joinRoomHandler = async (ws: WebSocket, data: JoinRoomReq) => {
  if (!isValidSchema(data, JOIN_ROOM_SCHEMA_NAME)) {
    return sendResponse(ws, JOIN_ROOM_ERROR_RESPONSE, { errorCode: JOIN_ROOM_ERROR_CODES.INVALID_ROOM_REQ });
  }

  const { userId } = ws.userToken;
  const { roomId, name } = data;

  let roomExists: boolean;
  try {
    roomExists = (await gameStatePublisherClient.exists(data.roomId)) > 0;
  } catch {
    return sendResponse(ws, JOIN_ROOM_ERROR_RESPONSE, { errorCode: REDIS_ERROR_CODES.COMMAND_FAILURE });
  }

  if (!roomExists) {
    return sendResponse(ws, JOIN_ROOM_ERROR_RESPONSE, { errorCode: JOIN_ROOM_ERROR_CODES.ROOM_NOT_FOUND });
  }

  const newPlayer = createNewPlayerState(userId, name);

  let sanitizedRoomState: SanitizedGameState;
  try {
    sanitizedRoomState = await joinRoomTransaction(roomId, newPlayer);
  } catch (err) {
    return sendResponse(ws, JOIN_ROOM_ERROR_RESPONSE, { errorCode: JOIN_ROOM_ERROR_CODES.TRANSACTION_FAILURE });
  }

  try {
    await storePlayerDetailsHandler(roomId, ws);
  } catch {
    return sendResponse(ws, JOIN_ROOM_ERROR_RESPONSE, {
      errorCode: JOIN_ROOM_ERROR_CODES.STORE_PLAYER_TOKEN_HANDLER_FAILED,
    });
  }
  await subscribeRoomHandler(ws, data.roomId);
  await publishMessageHandler(data.roomId, ADD_PLAYER_RESPONSE, { player: newPlayer }, userId);

  sendResponse(ws, JOIN_ROOM_RESPONSE, sanitizedRoomState);
};
