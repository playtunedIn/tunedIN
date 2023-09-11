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
