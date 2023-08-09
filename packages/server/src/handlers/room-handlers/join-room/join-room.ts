// Import necessary modules and types
import { WebSocket } from 'ws';
import { getValue, publishChannel, setValue } from '../../../clients/redis/redis-client';
import validator from '../../message.validator';
import { subscribeGameHandler } from '../../game-handlers/subscribe-game/subscribe-game';
import { JOIN_ROOM_SCHEMA_NAME, JoinRoomReq } from './join-room.validator';
import { GameState, PlayerState } from 'src/clients/redis/models/game-state';

export const joinRoomHandler = async (ws: WebSocket, data: JoinRoomReq) => {
  if (!isValidJoinRoomReq(data)) {
    return ws.send('Error: Invalid Room Req');
  }

  const gameStateJson = await getValue(data.roomId);

  if (!gameStateJson) {
    return ws.send('Room not found');
  }
  const gameState: GameState = JSON.parse(gameStateJson);

  if (gameState.players.length >= 4) {
    return ws.send('Room is full. Unable to join.');
  }

  if (gameState.players.some(player => player.playerId === data.playerId)) {
    return ws.send(`Player: ${data.playerId}, is already in the room.`);
  }

  const newPlayer: PlayerState = {
    playerId: data.playerId,
    score: 0,
    answers: [],
  };

  gameState.players.push(newPlayer);

  if (gameState.players.length === 1) {
    gameState.host = newPlayer.playerId;
  }

  const gameStateStr = JSON.stringify(gameState);

  await setValue(gameState.roomId, gameStateStr);
  await publishChannel(gameState.roomId, gameStateStr);
  await subscribeGameHandler(ws, gameState.roomId);
  ws.send(`Joined Room: ${data.roomId}`);
  ws.send(`Room Information: ${gameStateStr}`);
};

const isValidJoinRoomReq = (data: JoinRoomReq) => {
  const validate = validator.getSchema<JoinRoomReq>(JOIN_ROOM_SCHEMA_NAME);

  return Boolean(validate?.(data));
};
