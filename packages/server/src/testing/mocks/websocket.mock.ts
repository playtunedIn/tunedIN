import type { WebSocket } from 'ws';
import { vi } from 'vitest';

import type { MessageHandlerResponse } from 'src/handlers/responses';
import { createMockAuthContext } from 'src/testing/mocks/auth.mock';

export const createMockWebSocketMessage = <T extends object>(messageType: MessageHandlerResponse, data: T) => {
  const message = {
    type: messageType,
    data,
  };

  return JSON.stringify(message);
};

export const createMockWebSocket = () => {
  const mockWebSocket = {
    send: vi.fn(),
  } as unknown as WebSocket;

  mockWebSocket.userToken = createMockAuthContext();

  return mockWebSocket;
};
