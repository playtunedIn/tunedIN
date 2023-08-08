import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

import { useCreateRoomResponseHandlers } from '../create-room-handlers';
import { wrapMultiplayerProvider } from '@testing/helpers/multiplayer-helpers';
import { setupStore } from '@store/store';

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
    vi.restoreAllMocks();
  });

  it('should call console log', () => {
    const store = setupStore();
    const { result, unmount } = renderHook(() => useCreateRoomResponseHandlers(), {
      wrapper: wrapMultiplayerProvider({ store }),
    });

    result.current.createRoomResponseHandler({ roomId: 'test' });

    expect(store.getState().room.roomId).toEqual('test');
    unmount();
  });

  it('should call console error', () => {
    const store = setupStore();
    const { result, unmount } = renderHook(() => useCreateRoomResponseHandlers(), {
      wrapper: wrapMultiplayerProvider(),
    });

    result.current.createRoomErrorResponseHandler({ errorCode: 'test' });

    expect(console.error).toHaveBeenCalled();
    expect(store.getState().room.roomId).toEqual('');
    unmount();
  });
});
