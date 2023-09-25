import { vi } from 'vitest';

import type { GameState, PlayerRoomSession, PlayerState } from 'src/clients/redis/models/game-state';
import type { SubscribedMessageHandlerResponse } from 'src/handlers/room-handlers/types/response';

export const createMockGameState = (): GameState => ({
  roomId: '',
  host: '',
  players: [],
  questions: [],
});

export const createMockPlayerState = (): PlayerState => ({
  playerId: 'test player id',
  name: 'Joe Smith',
  score: 0,
  answers: [],
});

export const createMockPlayerSessionState = (): PlayerRoomSession => ({
  roomId: '',
});

export const createMockPublisherPayload = <T extends object>(
  userId: string,
  type: SubscribedMessageHandlerResponse,
  data: T
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
