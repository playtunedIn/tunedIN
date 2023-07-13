import { WebSocket } from 'ws';

import { setValue } from '../../../clients/redis/redis-client';
import validator from '../../message.validator';
import { CREATE_ROOM_SCHEMA_NAME, CreateRoomReq } from './create-room.validator';

export const createRoomHandler = async (ws: WebSocket, data: CreateRoomReq) => {
  if (!isValidCreateRoomReq(data)) {
    return ws.send('Error');
  }

  const defaultGameState = {
    roomId: data.roomId,
    hostId: '',
    players: [],
    questions: [],
  };

  await setValue(defaultGameState.roomId, JSON.stringify(defaultGameState));
  ws.send(`Created room: ${defaultGameState.roomId}`);
};

const isValidCreateRoomReq = (data: CreateRoomReq) => {
  const validate = validator.getSchema<CreateRoomReq>(CREATE_ROOM_SCHEMA_NAME);
  return Boolean(validate?.(data));
};
