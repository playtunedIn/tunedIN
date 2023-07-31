import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as MockWebSocketWrapper from '../../websocket-wrapper';
import * as MockUseSocketMessageHandlers from '../socket-message-handlers';
import { useSocketHandlers } from '../socket-handlers';

const originalConsoleError = console.error;

describe('Socket Handlers', () => {
  beforeEach(() => {
    console.error = vi.fn();
    vi.stubGlobal('WebSocket', vi.fn());
    vi.useFakeTimers();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    vi.restoreAllMocks();
  });

  it('should call console error (onError)', () => {
    const { onError } = useSocketHandlers(vi.fn());

    onError(new Event('TestSocketError'));

    expect(console.error).toHaveBeenCalled();
  });

  it('should recreate websocket session (onClose)', () => {
    const { onClose } = useSocketHandlers(vi.fn());

    onClose();
    vi.runAllTimers();

    expect(MockWebSocketWrapper.WebSocketWrapper).toHaveBeenCalled();
  });

  it('should error when JSON is non-parsable', () => {
    const { onMessage } = useSocketHandlers(vi.fn());

    const message = new MessageEvent('message', { data: 'not a parsable string' });
    onMessage(message);

    expect(console.error).toHaveBeenCalled();
  });

  it('should error when unknown handler type', () => {
    const { onMessage } = useSocketHandlers(vi.fn());

    const messageData = { type: 'unknownMessage' };
    const message = new MessageEvent('message', { data: JSON.stringify(messageData) });
    onMessage(message);

    expect(console.error).toHaveBeenCalled();
  });

  it('should call the correct message handler', () => {
    const createRoomResponseSpy = vi.fn();
    vi.spyOn(MockUseSocketMessageHandlers, 'useSocketMessageHandlers').mockImplementation(() => ({
      messageHandlers: {
        createRoomResponse: createRoomResponseSpy,
      } as any,
    }));
    const { onMessage } = useSocketHandlers(vi.fn());

    const messageData = { type: 'createRoomResponse', data: { roomId: 'test' } };
    const message = new MessageEvent('message', { data: JSON.stringify(messageData) });
    onMessage(message);

    expect(createRoomResponseSpy).toHaveBeenCalled();
  });
});
