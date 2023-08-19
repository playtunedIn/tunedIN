import type { WebSocket } from 'ws';

import { getValue, publishChannel, setValue } from '../../../clients/redis/redis-client';
import { isValidSchema } from '../../message.validator';
import { subscribeGameHandler } from '../../game-handlers/subscribe-game/subscribe-game';
import type { JoinRoomReq } from './join-room.validator';
import { JOIN_ROOM_SCHEMA_NAME } from './join-room.validator';
import type { GameState, PlayerState } from 'src/clients/redis/models/game-state';
import { JoinRoomErrorCode } from './join-room.errors';
import { sendResponse } from '../../../utils/websocket-response';
import { JOIN_ROOM_ERROR_RESPONSE, JOIN_ROOM_RESPONSE } from '../../../handlers/room-handlers/types/response';

const PLAYER_LIMIT = 4;

export const joinRoomHandler = async (ws: WebSocket, data: JoinRoomReq) => {
  if (!isValidSchema(data, JOIN_ROOM_SCHEMA_NAME)) {
    return sendResponse(ws, JOIN_ROOM_ERROR_RESPONSE, { errorCode: JoinRoomErrorCode.InvalidRoomReq });
  }

  const gameStateJson = await getValue(data.roomId);
  if (!gameStateJson) {
    return sendResponse(ws, JOIN_ROOM_ERROR_RESPONSE, { errorCode: JoinRoomErrorCode.RoomNotFound });
  }

  let gameState: GameState;
  try {
    gameState = JSON.parse(gameStateJson);
  } catch (parseError) {
    return sendResponse(ws, JOIN_ROOM_ERROR_RESPONSE, { errorCode: JoinRoomErrorCode.GameStateParsingError });
  }

  if (gameState.players.length >= PLAYER_LIMIT) {
    sendResponse(ws, JOIN_ROOM_ERROR_RESPONSE, { errorCode: JoinRoomErrorCode.RoomFull });
    return;
  }

  if (gameState.players.some(player => player.playerId === data.playerId)) {
    return sendResponse(ws, JOIN_ROOM_ERROR_RESPONSE, { errorCode: JoinRoomErrorCode.PlayerAlreadyInRoom });
  }

  const newPlayer: PlayerState = createNewPlayerState(data);
  gameState.players.push(newPlayer);
  if (gameState.players.length === 1) {
    gameState.host = newPlayer.playerId;
  }

  let newGameState: string;
  try {
    newGameState = JSON.stringify(gameState);
  } catch (stringifyError) {
    return sendResponse(ws, JOIN_ROOM_ERROR_RESPONSE, { errorCode: JoinRoomErrorCode.GameStateStringifyingError });
  }

  try {
    await Promise.all([
      setValue(gameState.roomId, newGameState),
      publishChannel(gameState.roomId, newGameState),
      subscribeGameHandler(ws, gameState.roomId),
    ]);
  } catch (error) {
    sendResponse(ws, JOIN_ROOM_ERROR_RESPONSE, { errorCode: JoinRoomErrorCode.HandlerError });
  }

  sendResponse(ws, JOIN_ROOM_RESPONSE, gameState);
};

function createNewPlayerState(data: JoinRoomReq): PlayerState {
  return {
    playerId: data.playerId,
    score: 0,
    answers: [],
  };
}
