import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';

import { multiplayerProviderWrapper as wrapper } from '@testing/helpers/multiplayer-helpers';
import { WebSocketWrapper as MockWebSocketWrapper } from '../websocket-wrapper';
import { useMultiplayerClient } from '..';

describe('Multiplayer Client', () => {
  it('should send createRoom message', () => {
    const resultStr = JSON.stringify({ type: 'createRoom', data: { roomId: 'test' } });
    const { result, unmount } = renderHook(() => useMultiplayerClient(), { wrapper });

    result.current.createRoom();

    expect(MockWebSocketWrapper.prototype.send).toHaveBeenCalledWith(resultStr);
    unmount();
  });

  it('should send exitRoom message', () => {
    const resultStr = JSON.stringify({ type: 'exitRoom', data: { roomId: 'test' } });
    const { result, unmount } = renderHook(() => useMultiplayerClient(), { wrapper });

    result.current.exitRoom();

    expect(MockWebSocketWrapper.prototype.send).toHaveBeenCalledWith(resultStr);
    unmount();
  });
});
