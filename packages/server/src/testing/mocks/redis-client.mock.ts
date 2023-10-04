import { vi } from 'vitest';

import {
  ROOM_STATUS,
  type GameState,
  type PlayerRoomSession,
  type PlayerState,
} from '../../clients/redis/models/game-state';
import type { SubscribedMessageHandlerResponse } from 'src/handlers/responses';
import { GLOBAL_MOCK_USER_ID } from './auth.mock';

export const createMockGameState = (): GameState => ({
  roomId: '',
  hostId: '',
  roomStatus: ROOM_STATUS.LOBBY,
  players: [],
  questionIndex: 0,
  questions: [],
});

export const createMockPlayers = (): PlayerState[] => [
  {
    userId: GLOBAL_MOCK_USER_ID,
    name: 'Emil',
    answers: [null],
    score: 0,
  },
  {
    userId: 'test id 2',
    name: 'Matt',
    answers: [null],
    score: 0,
  },
];

export const createMockPlayerState = (): PlayerState => ({
  userId: 'test player id',
  name: 'Joe Smith',
  score: 0,
  answers: [],
});

export const createMockPlayerSessionState = (): PlayerRoomSession => ({
  roomId: '',
});

export const createMockPublisherPayload = <T extends object>(
  type: SubscribedMessageHandlerResponse,
  data: T,
  userId?: string
) => {
  const payload = {
    userId,
    type,
    data,
  };

  return JSON.stringify(payload);
};

const mockRedisCommands = {
  publish: vi.fn(),
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
  exists: vi.fn(),
  watch: vi.fn(),
  json: {
    get: vi.fn(),
    set: vi.fn(),
    arrAppend: vi.fn(),
  },
};

export const mockMultiCommand = {
  ...mockRedisCommands,
  exec: vi.fn(),
};

export const redisClientMock = {
  connect: vi.fn(),
  addListener: vi.fn(),
  multi: () => mockMultiCommand,
  ...mockRedisCommands,
};

vi.mock('redis', () => ({
  createClient: () => redisClientMock,
}));
