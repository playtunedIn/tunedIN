import type { WebSocket } from 'ws';

import { gameStatePublisherClient } from '../../../clients/redis';
import { isValidSchema } from '../../message.validator';
import type { CreateRoomReq } from './create-room.validator';
import { CREATE_ROOM_SCHEMA_NAME } from './create-room.validator';

export const createRoomHandler = async (ws: WebSocket, data: CreateRoomReq) => {
  if (!isValidSchema(data, CREATE_ROOM_SCHEMA_NAME)) {
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
