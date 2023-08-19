import type { WebSocket } from 'ws';

import { gameStatePublisherClient } from '../../../clients/redis';
import validator from '../../message.validator';
import type { CreateRoomReq } from './create-room.validator';
import { CREATE_ROOM_SCHEMA_NAME } from './create-room.validator';

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

  await gameStatePublisherClient.set(defaultGameState.roomId, JSON.stringify(defaultGameState));
  ws.send(`Created room: ${defaultGameState.roomId}`);
};

const isValidCreateRoomReq = (data: CreateRoomReq) => {
  const validate = validator.getSchema<CreateRoomReq>(CREATE_ROOM_SCHEMA_NAME);
  return Boolean(validate?.(data));
};
