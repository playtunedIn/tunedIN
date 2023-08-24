import type { WebSocket } from 'ws';
import { getValue, setValue } from '../../../clients/redis/redis-client';
import validator from '../../message.validator';
import type { CreateRoomReq } from './create-room.validator';
import { CREATE_ROOM_SCHEMA_NAME } from './create-room.validator';
import { CreateRoomErrorCode } from './create-room-errors';
import { joinRoomHandler } from '../join-room/join-room';

const roomIdLength = 4;

export const createRoomHandler = async (ws: WebSocket, data: CreateRoomReq) => {
  // Validate the incoming CreateRoomReq
  if (!isValidCreateRoomReq(data)) {
    return generateErrorResponse(ws, CreateRoomErrorCode.InvalidRoomReq);
  }

  // Generate a unique room ID
  const roomId = generateUniqueRoomId();

  // Define the default game state with the generated room ID
  const defaultGameStateJson = generateDefaultGameState(await roomId);

  let gameStateStr: string;
  try {
    // Convert default game state to JSON string
    gameStateStr = JSON.stringify(defaultGameStateJson);
  } catch (stringifyError) {
    return generateErrorResponse(ws, CreateRoomErrorCode.GameStateStringifyingError);
  }

  try {
    // Store the default game state in Redis
    await setValue(defaultGameStateJson.roomId, gameStateStr);
    // Send success response
    generateResponse(ws, gameStateStr);
  } catch {
    // Send error response if storage fails
    generateErrorResponse(ws, CreateRoomErrorCode.HandlerError);
  }

  // Prepare a JoinRoomReq to join the created room
  const joinRoomReq = generateJoinRoomReq(defaultGameStateJson, data);

  try {
    // Call joinRoomHandler to join the created room
    joinRoomHandler(ws, joinRoomReq);
  } catch {
    // Send error response if joinRoomHandler fails
    generateErrorResponse(ws, CreateRoomErrorCode.JoinRoomHandlerError);
  }
};

const isValidCreateRoomReq = (data: CreateRoomReq) => {
  const validate = validator.getSchema<CreateRoomReq>(CREATE_ROOM_SCHEMA_NAME);
  return Boolean(validate?.(data));
};

function generateJoinRoomReq(defaultGameStateJson: { roomId: string; hostId: string; players: never[]; questions: never[]; }, data: CreateRoomReq) {
  return {
    roomId: defaultGameStateJson.roomId,
    playerId: data.playerId,
  };
}

function generateDefaultGameState(roomId: string) {
  return {
    roomId: roomId,
    hostId: '',
    players: [],
    questions: [],
  };
}

async function generateUniqueRoomId(): Promise<string> {
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';

  for (let i = 0; i < roomIdLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  
  const existingGameStateJson = await getValue(result);

  if (existingGameStateJson) {
    generateUniqueRoomId;
  }

  return result;
}

const generateResponse = (ws: WebSocket, gameState: string): void => {
  const response = {
    type: 'CreateRoomResponse',
    data: gameState,
  };

  try {
    const responseJson = JSON.stringify(response);
    ws.send(responseJson);
  } catch (stringifyError) {
    console.error('Error while stringifying response JSON:', stringifyError);
  }
};

  await setValue(defaultGameState.roomId, JSON.stringify(defaultGameState));
  ws.send(`Created room: ${defaultGameState.roomId}`);
};
