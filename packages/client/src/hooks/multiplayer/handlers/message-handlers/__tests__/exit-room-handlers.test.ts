import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

import { setupStore } from '@store/store';
import { wrapMultiplayerProvider } from '@testing/helpers/multiplayer-helpers';
import { useExitRoomResponseHandlers } from '../exit-room-handlers';

const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe('Create Room Handlers', () => {
  beforeEach(() => {
    console.log = vi.fn();
    console.error = vi.fn();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    vi.resetAllMocks();
  });

  it('should call console log', () => {
    const store = setupStore();
    const { result, unmount } = renderHook(() => useExitRoomResponseHandlers(), {
      wrapper: wrapMultiplayerProvider({ store }),
    });

    result.current.exitRoomResponseHandler({ roomId: 'test' });

    expect(store.getState().room.roomId).toEqual('test');
    unmount();
  });

  it('should call console error', () => {
    const store = setupStore();
    const { result, unmount } = renderHook(() => useExitRoomResponseHandlers(), {
      wrapper: wrapMultiplayerProvider({ store }),
    });

    result.current.exitRoomErrorResponseHandler({ errorCode: 'test' });

    expect(console.error).toHaveBeenCalled();
    unmount();
  });
});
