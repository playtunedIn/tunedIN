import type { WebSocket } from 'ws';
import type { RedisJSON } from '@redis/json/dist/commands';

import { gameStatePublisherClient } from '../../../clients/redis';
import { isValidSchema } from '../../message.validator';
import type { CreateRoomReq } from './create-room.validator';
import { CREATE_ROOM_SCHEMA_NAME } from './create-room.validator';
import { ROOM_STATUS, type GameState } from '../../../clients/redis/models/game-state';

export const createRoomHandler = async (ws: WebSocket, data: CreateRoomReq) => {
  if (!isValidSchema(data, CREATE_ROOM_SCHEMA_NAME)) {
    return ws.send('Error');
  }

  const defaultGameState: GameState = {
    roomId: data.roomId,
    hostId: '',
    roomStatus: ROOM_STATUS.LOBBY,
    players: [],
    questions: [],
  };

  await gameStatePublisherClient.json.set(defaultGameState.roomId, '$', defaultGameState as unknown as RedisJSON);
  ws.send(`Created room: ${defaultGameState.roomId}`);
};
