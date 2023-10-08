import type { Mock } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { wrapMultiplayerProvider } from '@testing/helpers/multiplayer-helpers';
import { useSocket } from '../socket';
import { WebSocketWrapper as MockWebSocketWrapper } from '../websocket-wrapper';
import { JOIN_ROOM_MESSAGE } from '@hooks/multiplayer/handlers/socket-handlers.constants';

const originalConsoleError = console.error;

describe('Socket', () => {
  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    vi.resetAllMocks();
  });

  describe('sendMessage', () => {
    it('should error for non-stringable data', () => {
      const { result, unmount } = renderHook(() => useSocket(), { wrapper: wrapMultiplayerProvider() });

      const data: Record<string, unknown> = {};
      data.circularRef = data;
      act(() => result.current.sendMessage(JOIN_ROOM_MESSAGE, data));

      expect(console.error).toHaveBeenCalled();
      unmount();
    });

    it('should error when socket fails to send', () => {
      (MockWebSocketWrapper.prototype.send as Mock).mockImplementationOnce(() => {
        throw new Error('test');
      });

      const { result, unmount } = renderHook(() => useSocket(), { wrapper: wrapMultiplayerProvider() });

      act(() => result.current.sendMessage(JOIN_ROOM_MESSAGE));

      expect(console.error).toHaveBeenCalled();
      unmount();
    });

    it('should send message', () => {
      const { result, unmount } = renderHook(() => useSocket(), { wrapper: wrapMultiplayerProvider() });

      act(() => result.current.sendMessage(JOIN_ROOM_MESSAGE));

      expect(MockWebSocketWrapper.prototype.send).toHaveBeenCalled();
      unmount();
    });
  });

  describe('closeConnection', () => {
    it('should close connection', () => {
      const { result, unmount } = renderHook(() => useSocket(), { wrapper: wrapMultiplayerProvider() });

      act(() => result.current.closeConnection());

      expect(MockWebSocketWrapper.prototype.close).toHaveBeenCalled();
      unmount();
    });
  });
});
