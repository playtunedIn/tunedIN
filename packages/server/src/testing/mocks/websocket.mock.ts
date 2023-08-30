import type { WebSocket } from 'ws';
import { vi } from 'vitest';

export const createMockWebSocket = () =>
  ({
    send: vi.fn(),
  } as unknown as WebSocket);
