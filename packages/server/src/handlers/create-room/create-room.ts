import { WebSocket } from 'ws';

import { redisPub } from '../../clients/redis/redis-client';
import validator from '../message.validator';
import { CREATE_ROOM_SCHEMA_NAME, CreateRoomReq } from './create-room.validator';

export const createRoomHandler = (ws: WebSocket, data: CreateRoomReq) => {
  if (!isValidCreateRoomReq(data)) {
    return ws.send('Error');
  }

  const defaultGameState = {
    roomId: data.roomId,
    hostId: '',
    players: [],
    questions: [],
  };

  redisPub(data.roomId, JSON.stringify(defaultGameState));
};

const isValidCreateRoomReq = (data: CreateRoomReq) => {
  const validate = validator.getSchema<CreateRoomReq>(CREATE_ROOM_SCHEMA_NAME);
  return Boolean(validate?.(data));
};
