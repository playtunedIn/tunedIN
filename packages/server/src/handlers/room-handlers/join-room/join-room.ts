import type { WebSocket } from 'ws';
import { getValue, publishChannel, setValue } from '../../../clients/redis/redis-client';
import validator from '../../message.validator';
import { subscribeGameHandler } from '../../game-handlers/subscribe-game/subscribe-game';
import type { JoinRoomReq } from './join-room.validator';
import { JOIN_ROOM_SCHEMA_NAME } from './join-room.validator';
import type { GameState, PlayerState } from 'src/clients/redis/models/game-state';
import { JoinRoomErrorCode } from './join-room.errors';

const playerLimit = 4;

export const joinRoomHandler = async (ws: WebSocket, data: JoinRoomReq) => {
    if (!isValidJoinRoomReq(data)) {
      return generateErrorResponse(ws, JoinRoomErrorCode.InvalidRoomReq);
    }

    const gameStateJson = await getValue(data.roomId);
    if (!gameStateJson) {
      return generateErrorResponse(ws, JoinRoomErrorCode.RoomNotFound);
    }

    let gameState: GameState;
    try {
      gameState = JSON.parse(gameStateJson);
    } catch (parseError) {
      return generateErrorResponse(ws, JoinRoomErrorCode.GameStateParsingError);
    }

    if (gameState.players.length >= playerLimit) {
      generateErrorResponse(ws, JoinRoomErrorCode.RoomFull);
      return;
    }

    if (gameState.players.some(player => player.playerId === data.playerId)) {
      return generateErrorResponse(ws, JoinRoomErrorCode.PlayerAlreadyInRoom);
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
      return generateErrorResponse(ws, JoinRoomErrorCode.GameStateStringifyingError);
    }

    try {
      await Promise.all([
        setValue(gameState.roomId, newGameState),
        publishChannel(gameState.roomId, newGameState),
        subscribeGameHandler(ws, gameState.roomId),
      ]);
    } catch (error) {
      generateErrorResponse(ws, JoinRoomErrorCode.HandlerError);
    }

    generateResponse(ws, newGameState);
};

export const isValidJoinRoomReq = (data: JoinRoomReq) => {
  const validate = validator.getSchema<JoinRoomReq>(JOIN_ROOM_SCHEMA_NAME);
  return Boolean(validate?.(data));
};

function createNewPlayerState(data: JoinRoomReq): PlayerState {
  return {
    playerId: data.playerId,
    score: 0,
    answers: [],
  };
}

const generateResponse = (ws: WebSocket, gameState: string): void => {
  const response = {
    type: 'joinRoomResponse',
    data: gameState,
  };

  try {
    const responseJson = JSON.stringify(response);
    ws.send(responseJson);
  } catch (stringifyError) {
    console.error('Error while stringifying response JSON:', stringifyError);
  }
};

export const generateErrorResponse = (ws: WebSocket, errorCode: JoinRoomErrorCode): void => {
  const errorResponse = {
    type: 'joinRoomErrorResponse',
    data: errorCode,
  };

  try {
    const responseJson = JSON.stringify(errorResponse);
    ws.send(responseJson);
  } catch (stringifyError) {
    console.error('Error while stringifying response JSON:', stringifyError);
  }
};
