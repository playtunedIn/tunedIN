import { vi } from 'vitest';

import type { WebSocketMessageTypes } from '@hooks/multiplayer/handlers/socket-handlers.constants';

vi.mock('@hooks/multiplayer/websocket-wrapper', () => {
  const WebSocketWrapper = vi.fn();
  WebSocketWrapper.prototype.addEventListener = vi.fn();
  WebSocketWrapper.prototype.removeEventListener = vi.fn();
  WebSocketWrapper.prototype.send = vi.fn();
  WebSocketWrapper.prototype.close = vi.fn();

  return { WebSocketWrapper };
});

export const createMockWebSocketMessage = <T extends object>(messageType: WebSocketMessageTypes, data?: T) => {
  const message: Record<string, unknown> = {
    type: messageType,
  };

  if (data) {
    message.data = data;
  }

  return JSON.stringify(message);
};
