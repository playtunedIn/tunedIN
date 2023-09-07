import type { WebSocket } from 'ws';
import { isValidSchema } from '../../message.validator';
import type { CreateRoomReq } from './create-room.validator';
import { CREATE_ROOM_SCHEMA_NAME } from './create-room.validator';
import { CREATE_ROOM_ERROR_CODES } from './create-room-errors';
import { sendResponse } from '../../../utils/websocket-response';
import { CREATE_ROOM_ERROR_RESPONSE, CREATE_ROOM_RESPONSE } from '../types/response';
import { gameStatePublisherClient } from '../../../clients/redis';
import { generateDefaultGameState, generateUniqueRoomId } from '../../../utils/handlerUtils';

export const createRoomHandler = async (ws: WebSocket, data: CreateRoomReq) => {
  if (!isValidSchema(data, CREATE_ROOM_SCHEMA_NAME)) {
    return sendResponse(ws, CREATE_ROOM_ERROR_RESPONSE, { errorCode: CREATE_ROOM_ERROR_CODES.InvalidRoomReq });
  }

  const roomId = generateUniqueRoomId();
  const isActiveRoom = await gameStatePublisherClient.get(roomId);
  if (isActiveRoom) {
    return sendResponse(ws, CREATE_ROOM_ERROR_RESPONSE, { errorCode: CREATE_ROOM_ERROR_CODES.GenerateIdError });
  }

  const defaultGameStateJson = generateDefaultGameState(roomId);

  let gameStateStr: string;
  try {
    gameStateStr = JSON.stringify(defaultGameStateJson);
  } catch (stringifyError) {
    return sendResponse(ws, CREATE_ROOM_ERROR_RESPONSE, {
      errorCode: CREATE_ROOM_ERROR_CODES.GameStateStringifyingError,
    });
  }

  try {
    await gameStatePublisherClient.set(roomId, gameStateStr);
    sendResponse(ws, CREATE_ROOM_RESPONSE, defaultGameStateJson);
  } catch {
    console.log(roomId);
    return sendResponse(ws, CREATE_ROOM_ERROR_RESPONSE, { errorCode: CREATE_ROOM_ERROR_CODES.HandlerError });
  }
};
