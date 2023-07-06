import { WebSocket } from 'ws';

import { redisSub } from '../../clients/redis/redis-client';
import validator from '../message.validator';
import { JOIN_ROOM_SCHEMA_NAME, JoinRoomReq } from './join-room.validator';

export const joinRoomHandler = (ws: WebSocket, data: JoinRoomReq) => {
  if (!isValidJoinRoomReq(data)) {
    return ws.send('Error');
  }

  redisSub(data.roomId, () => {
    ws.send('room starting');
  });
};

const isValidJoinRoomReq = (data: JoinRoomReq) => {
  const validate = validator.getSchema<JoinRoomReq>(JOIN_ROOM_SCHEMA_NAME);
  return Boolean(validate?.(data));
};
