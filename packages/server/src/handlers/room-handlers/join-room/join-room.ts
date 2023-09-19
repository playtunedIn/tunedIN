import type { WebSocket } from 'ws';

import { JOIN_ROOM_ERROR_CODES, REDIS_ERROR_CODES } from '../../../errors';
import { gameStatePublisherClient } from '../../../clients/redis';
import { isValidSchema } from '../../message.validator';
import { subscribeGameHandler } from '../../game-handlers/subscribe-game/subscribe-game';
import type { JoinRoomReq } from './join-room.validator';
import { JOIN_ROOM_SCHEMA_NAME } from './join-room.validator';
import type { PlayerState } from 'src/clients/redis/models/game-state';
import { sendResponse } from '../../../utils/websocket-response';
import { JOIN_ROOM_ERROR_RESPONSE, JOIN_ROOM_RESPONSE } from '../../../handlers/room-handlers/types/response';
import { joinRoomTransaction } from './join-room-transaction';

export const joinRoomHandler = async (ws: WebSocket, data: JoinRoomReq) => {
  if (!isValidSchema(data, JOIN_ROOM_SCHEMA_NAME)) {
    return sendResponse(ws, JOIN_ROOM_ERROR_RESPONSE, { errorCode: JOIN_ROOM_ERROR_CODES.INVALID_ROOM_REQ });
  }

  const { roomId, playerId } = data;

  let roomExists: boolean;
  try {
    roomExists = (await gameStatePublisherClient.exists(data.roomId)) > 0;
  } catch {
    return sendResponse(ws, JOIN_ROOM_ERROR_RESPONSE, { errorCode: REDIS_ERROR_CODES.COMMAND_FAILURE });
  }

  if (!roomExists) {
    return sendResponse(ws, JOIN_ROOM_ERROR_RESPONSE, { errorCode: JOIN_ROOM_ERROR_CODES.ROOM_NOT_FOUND });
  }

  let players: PlayerState[];
  try {
    players = await joinRoomTransaction(roomId, playerId);
  } catch (err) {
    return sendResponse(ws, JOIN_ROOM_ERROR_RESPONSE, { errorCode: (err as Error).message });
  }

  await subscribeGameHandler(ws, data.roomId);
  await gameStatePublisherClient.publish(data.roomId, 'PLAYER JOINED');

  sendResponse(ws, JOIN_ROOM_RESPONSE, players);
};
