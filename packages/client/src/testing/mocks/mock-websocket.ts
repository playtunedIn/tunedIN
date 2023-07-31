import { vi } from 'vitest';

vi.mock('@hooks/multiplayer/websocket-wrapper', () => {
  const WebSocketWrapper = vi.fn();
  WebSocketWrapper.prototype.addEventListener = vi.fn();
  WebSocketWrapper.prototype.removeEventListener = vi.fn();
  WebSocketWrapper.prototype.send = vi.fn();

  return { WebSocketWrapper };
});
