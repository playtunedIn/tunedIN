import { vi } from 'vitest';

import type { GameState } from 'src/clients/redis/models/game-state';

export const createMockGameState = (): GameState => ({
  roomId: '',
  host: '',
  players: [],
  questions: [],
});

vi.mock('redis', () => ({
  createClient: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    publish: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
  })),
}));
