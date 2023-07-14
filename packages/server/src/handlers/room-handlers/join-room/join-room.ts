import { WebSocket } from 'ws';

import { getValue, publishChannel, setValue } from '../../../clients/redis/redis-client';
import validator from '../../message.validator';
import { subscribeGameHandler } from '../../game-handlers/subscribe-game/subscribe-game';
import { JOIN_ROOM_SCHEMA_NAME, JoinRoomReq } from './join-room.validator';

export const joinRoomHandler = async (ws: WebSocket, data: JoinRoomReq) => {
  if (!isValidJoinRoomReq(data)) {
    return ws.send('Error');
  }

  const gameState = JSON.parse((await getValue(data.roomId)) as string);
  gameState.players.push('player 2');

  const gameStateStr = JSON.stringify(gameState);
  await setValue(gameState.roomId, gameStateStr);
  await publishChannel(gameState.roomId, gameStateStr);

  await subscribeGameHandler(ws, gameState.roomId);
};

const isValidJoinRoomReq = (data: JoinRoomReq) => {
  const validate = validator.getSchema<JoinRoomReq>(JOIN_ROOM_SCHEMA_NAME);
  return Boolean(validate?.(data));
};
