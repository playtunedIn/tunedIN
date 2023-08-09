import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

import { wrapMultiplayerProvider } from '@testing/helpers/multiplayer-helpers';
import * as MockWebSocketWrapper from '../../websocket-wrapper';
import * as MockUseSocketMessageHandlers from '../socket-message-handlers';
import { useSocketHandlers } from '../socket-handlers';
import { SOCKET_READY_STATES } from '../socket-handlers.constants';

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

  describe('onOpen', () => {
    it('should call console error (onError)', () => {
      const socketReadySpy = vi.fn();
      const { result, unmount } = renderHook(() => useSocketHandlers(vi.fn(), socketReadySpy), {
        wrapper: wrapMultiplayerProvider(),
      });

      result.current.onOpen();

      expect(socketReadySpy).toHaveBeenCalledWith(SOCKET_READY_STATES.OPEN);
      unmount();
    });
  });

  describe('onError', () => {
    it('should call console error (onError)', () => {
      const { result, unmount } = renderHook(() => useSocketHandlers(vi.fn(), vi.fn()), {
        wrapper: wrapMultiplayerProvider(),
      });

      result.current.onError(new Event('TestSocketError'));

      expect(console.error).toHaveBeenCalled();
      unmount();
    });
  });

  describe('onClose', () => {
    it('should recreate websocket session (onClose)', () => {
      const { result, unmount } = renderHook(() => useSocketHandlers(vi.fn(), vi.fn()), {
        wrapper: wrapMultiplayerProvider(),
      });

      result.current.onError(new Event('TestSocketError'));
      result.current.onClose();
      vi.runAllTimers();

      expect(MockWebSocketWrapper.WebSocketWrapper).toHaveBeenCalled();
      unmount();
    });
  });

  describe('onMessage', () => {
    it('should error when JSON is non-parsable', () => {
      const { result, unmount } = renderHook(() => useSocketHandlers(vi.fn(), vi.fn()), {
        wrapper: wrapMultiplayerProvider(),
      });

      const message = new MessageEvent('message', { data: 'not a parsable string' });
      result.current.onMessage(message);

      expect(console.error).toHaveBeenCalled();
      unmount();
    });

    it('should error when unknown handler type', () => {
      const { result, unmount } = renderHook(() => useSocketHandlers(vi.fn(), vi.fn()), {
        wrapper: wrapMultiplayerProvider(),
      });

      const messageData = { type: 'unknownMessage' };
      const message = new MessageEvent('message', { data: JSON.stringify(messageData) });
      result.current.onMessage(message);

      expect(console.error).toHaveBeenCalled();
      unmount();
    });

    it('should call the correct message handler', () => {
      const createRoomResponseSpy = vi.fn();
      vi.spyOn(MockUseSocketMessageHandlers, 'useSocketMessageHandlers').mockImplementation(() => ({
        messageHandlers: {
          createRoomResponse: createRoomResponseSpy,
        } as any,
      }));
      const { result, unmount } = renderHook(() => useSocketHandlers(vi.fn(), vi.fn()), {
        wrapper: wrapMultiplayerProvider(),
      });

      const messageData = { type: 'createRoomResponse', data: { roomId: 'test' } };
      const message = new MessageEvent('message', { data: JSON.stringify(messageData) });
      result.current.onMessage(message);

      expect(createRoomResponseSpy).toHaveBeenCalled();
      unmount();
    });
  });
});
