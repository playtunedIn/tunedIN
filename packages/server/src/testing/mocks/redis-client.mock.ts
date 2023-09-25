import { vi } from 'vitest';

import type { GameState, PlayerRoomSession } from 'src/clients/redis/models/game-state';

export const createMockGameState = (): GameState => ({
  roomId: '',
  host: '',
  players: [],
  questions: [],
});

export const createMockPlayerSessionState = (): PlayerRoomSession => ({
  roomId: '',
});

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
