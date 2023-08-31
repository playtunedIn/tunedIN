import type { WebSocket } from 'ws';
import { isValidSchema } from '../../message.validator';
import type { CreateRoomReq } from './create-room.validator';
import { CREATE_ROOM_SCHEMA_NAME } from './create-room.validator';
import { CREATE_ROOM_ERROR_CODES } from './create-room-errors';
import { joinRoomHandler } from '../join-room/join-room';
import { sendResponse } from '../../../utils/websocket-response';
import { CREATE_ROOM_ERROR_RESPONSE, CREATE_ROOM_RESPONSE } from '../types/response';
import { generateDefaultGameState, generateJoinRoomReq, generateUniqueRoomId } from './create-room.utils';
import { gameStatePublisherClient } from '../../../clients/redis';

const ROOM_ID_LENGTH = 4;

export const createRoomHandler = async (ws: WebSocket, data: CreateRoomReq) => {
  if (!isValidSchema(data, CREATE_ROOM_SCHEMA_NAME)) {
    return sendResponse(ws, CREATE_ROOM_ERROR_RESPONSE, { errorCode: CREATE_ROOM_ERROR_CODES.InvalidRoomReq });
  }

  //todo playerstate check
  // if (await playerStatePublisherClient.get(data.playerId)) {
  //   return sendResponse(ws, CREATE_ROOM_ERROR_RESPONSE, { errorCode: CREATE_ROOM_ERROR_CODES.PlayerAlreadyInRoom });
  // }

  const roomId = generateUniqueRoomId(ROOM_ID_LENGTH);
  if ((await roomId).length != ROOM_ID_LENGTH) {
    return sendResponse(ws, CREATE_ROOM_ERROR_RESPONSE, { errorCode: CREATE_ROOM_ERROR_CODES.GenerateIdError });
  }

  const defaultGameStateJson = generateDefaultGameState(await roomId);

  let gameStateStr: string;
  try {
    gameStateStr = JSON.stringify(defaultGameStateJson);
  } catch (stringifyError) {
    return sendResponse(ws, CREATE_ROOM_ERROR_RESPONSE, {
      errorCode: CREATE_ROOM_ERROR_CODES.GameStateStringifyingError,
    });
  }

  try {
    await gameStatePublisherClient.set(defaultGameStateJson.roomId, gameStateStr);
    sendResponse(ws, CREATE_ROOM_RESPONSE, defaultGameStateJson);
  } catch {
    return sendResponse(ws, CREATE_ROOM_ERROR_RESPONSE, { errorCode: CREATE_ROOM_ERROR_CODES.HandlerError });
  }

  const joinRoomReq = generateJoinRoomReq(defaultGameStateJson, data);
  try {
    joinRoomHandler(ws, joinRoomReq);
  } catch {
    return sendResponse(ws, CREATE_ROOM_ERROR_RESPONSE, { errorCode: CREATE_ROOM_ERROR_CODES.JoinRoomHandlerError });
  }
};
