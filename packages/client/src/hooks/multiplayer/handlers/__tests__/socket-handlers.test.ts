import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RenderHookResult } from '@testing-library/react';
import { renderHook } from '@testing-library/react';

import { wrapMultiplayerProvider } from '@testing/helpers/multiplayer-helpers';
import * as MockWebSocketWrapper from '../../websocket-wrapper';
import * as MockUseSocketMessageHandlers from '../socket-message-handlers';
import { useSocketHandlers } from '../socket-handlers';
import { SOCKET_READY_STATES } from '../socket-handlers.constants';

const originalConsoleError = console.error;

describe('Socket Handlers', () => {
  let hookUtils: RenderHookResult<ReturnType<typeof useSocketHandlers>, unknown>;

  const setSocketSpy = vi.fn();
  const setSocketStatusSpy = vi.fn();
  const setPingTimeoutSpy = vi.fn();
  const setNeedsRecoverySpy = vi.fn();

  const createRoomResponseSpy = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();

    console.error = vi.fn();

    vi.spyOn(MockUseSocketMessageHandlers, 'useSocketMessageHandlers').mockImplementation(() => ({
      messageHandlers: {
        createRoomResponse: createRoomResponseSpy,
      } as any,
    }));

    hookUtils = renderHook(
      () =>
        useSocketHandlers(
          new MockWebSocketWrapper.WebSocketWrapper('wss://example.com'),
          setSocketSpy,
          setSocketStatusSpy,
          undefined,
          setPingTimeoutSpy,
          false,
          setNeedsRecoverySpy
        ),
      {
        wrapper: wrapMultiplayerProvider(),
      }
    );
  });

  afterEach(() => {
    hookUtils.unmount();
    console.error = originalConsoleError;
    vi.resetAllMocks();
  });

  describe('onOpen', () => {
    it('should call console error (onError)', () => {
      hookUtils.result.current.onOpen();

      expect(setSocketStatusSpy).toHaveBeenCalledWith(SOCKET_READY_STATES.OPEN);
    });

    it('should request room session when in recovery flow', () => {
      const socket = new MockWebSocketWrapper.WebSocketWrapper('wss://example.com');
      const { result } = renderHook(
        () =>
          useSocketHandlers(
            socket,
            setSocketSpy,
            setSocketStatusSpy,
            undefined,
            setPingTimeoutSpy,
            true,
            setNeedsRecoverySpy
          ),
        {
          wrapper: wrapMultiplayerProvider(),
        }
      );

      result.current.onOpen();

      expect(socket.send).toHaveBeenCalledWith(JSON.stringify({ type: 'recoverRoomSession' }));
    });
  });

  describe('onPing', () => {
    it('should create a new socket if ping times out', () => {
      hookUtils.result.current.onPing();

      vi.runAllTimers();

      expect(MockWebSocketWrapper.WebSocketWrapper).toHaveBeenCalled();
    });
  });

  describe('onError', () => {
    it('should call console error (onError)', () => {
      hookUtils.result.current.onError(new Event('TestSocketError'));

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('onClose', () => {
    it('should recreate websocket session (onClose)', () => {
      hookUtils.result.current.onError(new Event('TestSocketError'));
      hookUtils.result.current.onClose(new CloseEvent('test'));
      vi.runAllTimers();

      expect(MockWebSocketWrapper.WebSocketWrapper).toHaveBeenCalled();
    });
  });

  describe('onMessage', () => {
    it('should error when JSON is non-parsable', () => {
      const message = new MessageEvent('message', { data: 'not a parsable string' });
      hookUtils.result.current.onMessage(message);

      expect(console.error).toHaveBeenCalled();
    });

    it('should error when unknown handler type', () => {
      const messageData = { type: 'unknownMessage' };
      const message = new MessageEvent('message', { data: JSON.stringify(messageData) });
      hookUtils.result.current.onMessage(message);

      expect(console.error).toHaveBeenCalled();
    });

    it('should call the correct message handler', () => {
      const messageData = { type: 'createRoomResponse', data: { roomId: 'test' } };
      const message = new MessageEvent('message', { data: JSON.stringify(messageData) });
      hookUtils.result.current.onMessage(message);

      expect(createRoomResponseSpy).toHaveBeenCalled();
    });
  });
});
