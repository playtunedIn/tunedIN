import type { WebSocket } from 'ws';
import { isValidSchema } from '../../message.validator';
import type { CreateRoomReq } from './create-room.validator';
import { CREATE_ROOM_SCHEMA_NAME } from './create-room.validator';
import { sendResponse } from '../../../utils/websocket-response';
import { CREATE_ROOM_ERROR_RESPONSE, CREATE_ROOM_RESPONSE } from '../../responses';
import { ROOT_QUERY, gameStatePublisherClient } from '../../../clients/redis';
import { generateDefaultGameState, generateUniqueRoomId } from '../../../utils/room-helpers';
import { REDIS_ERROR_CODES, CREATE_ROOM_ERROR_CODES } from 'src/errors';

export const createRoomHandler = async (ws: WebSocket, data: CreateRoomReq) => {
  if (!isValidSchema(data, CREATE_ROOM_SCHEMA_NAME)) {
    return sendResponse(ws, CREATE_ROOM_ERROR_RESPONSE, { errorCode: CREATE_ROOM_ERROR_CODES.INVALID_REQ });
  }

  const roomId = generateUniqueRoomId();

  let roomExists: boolean;
  try {
    roomExists = (await gameStatePublisherClient.exists(roomId)) > 0;
  } catch {
    return sendResponse(ws, CREATE_ROOM_ERROR_RESPONSE, { errorCode: REDIS_ERROR_CODES.COMMAND_FAILURE });
  }

  if (roomExists) {
    return sendResponse(ws, CREATE_ROOM_ERROR_RESPONSE, { errorCode: CREATE_ROOM_ERROR_CODES.GENERATE_ID_ERROR });
  }

  const defaultGameStateJson = generateDefaultGameState(roomId);

  try {
    await gameStatePublisherClient.json.set(roomId, ROOT_QUERY, defaultGameStateJson);
  } catch {
    return sendResponse(ws, CREATE_ROOM_ERROR_RESPONSE, { errorCode: REDIS_ERROR_CODES.COMMAND_FAILURE });
  }

  sendResponse(ws, CREATE_ROOM_RESPONSE, defaultGameStateJson);
};
