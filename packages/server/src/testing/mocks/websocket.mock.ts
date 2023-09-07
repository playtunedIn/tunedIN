import type { WebSocket } from 'ws';
import { vi } from 'vitest';
import { createMockAuthContext } from 'src/testing/mocks/auth.mock';

export const createMockWebSocket = () => {
  const mockWebSocket = {
    send: vi.fn(),
  } as unknown as WebSocket;

  mockWebSocket.userToken = createMockAuthContext();

  return mockWebSocket;
};
