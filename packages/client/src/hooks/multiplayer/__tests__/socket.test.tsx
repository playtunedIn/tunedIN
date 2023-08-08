import type { Mock } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { wrapMultiplayerProvider } from '@testing/helpers/multiplayer-helpers';
import { useSocket } from '../socket';
import { WebSocketWrapper as MockWebSocketWrapper } from '../websocket-wrapper';

const originalConsoleError = console.error;

describe('Socket', () => {
  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    vi.restoreAllMocks();
  });

  describe('sendMessage', () => {
    it('should error for non-stringable data', () => {
      const { result, unmount } = renderHook(() => useSocket(), { wrapper: wrapMultiplayerProvider() });

      const message: Record<string, unknown> = {};
      message.circularRef = message;
      act(() => result.current.sendMessage(message));

      expect(console.error).toHaveBeenCalled();
      unmount();
    });

    it('should error when socket fails to send', () => {
      (MockWebSocketWrapper.prototype.send as Mock).mockImplementationOnce(() => {
        throw new Error('test');
      });

      const { result, unmount } = renderHook(() => useSocket(), { wrapper: wrapMultiplayerProvider() });

      act(() => result.current.sendMessage({}));

      expect(console.error).toHaveBeenCalled();
      unmount();
    });

    it('should send message', () => {
      const { result, unmount } = renderHook(() => useSocket(), { wrapper: wrapMultiplayerProvider() });

      act(() => result.current.sendMessage({}));

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
