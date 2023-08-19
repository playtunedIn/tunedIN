import type { WebSocket } from 'ws';

import { gameStatePublisherClient } from '../../../clients/redis';
import validator from '../../message.validator';
import { subscribeGameHandler } from '../../game-handlers/subscribe-game/subscribe-game';
import type { JoinRoomReq } from './join-room.validator';
import { JOIN_ROOM_SCHEMA_NAME } from './join-room.validator';

export const joinRoomHandler = async (ws: WebSocket, data: JoinRoomReq) => {
  if (!isValidJoinRoomReq(data)) {
    return ws.send('Error');
  }

  const gameState = JSON.parse((await gameStatePublisherClient.get(data.roomId)) as string);
  gameState.players.push('player 2');

  const gameStateStr = JSON.stringify(gameState);
  await gameStatePublisherClient.set(gameState.roomId, gameStateStr);
  await gameStatePublisherClient.publishChanges(gameState.roomId, gameStateStr);

  await subscribeGameHandler(ws, gameState.roomId);
};

const isValidJoinRoomReq = (data: JoinRoomReq) => {
  const validate = validator.getSchema<JoinRoomReq>(JOIN_ROOM_SCHEMA_NAME);
  return Boolean(validate?.(data));
};
