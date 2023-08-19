import { vi } from 'vitest';

import type { GameState } from 'src/clients/redis/models/game-state';

export const createMockGameState = (): GameState => ({
  roomId: '',
  players: [],
  questions: [],
});

export const redisClientMock = {
  connect: vi.fn(),
  addListener: vi.fn(),
  publish: vi.fn(),
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
};

vi.mock('redis', () => ({
  createClient: vi.fn().mockImplementation(() => redisClientMock),
}));
