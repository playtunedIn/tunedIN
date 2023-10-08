import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

import { useStartGameResponseHandlers } from '../start-game-handlers';
import { wrapMultiplayerProvider } from '@testing/helpers/multiplayer-helpers';
import { setupStore } from '@store/store';

describe('Create Room Handlers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('updates room error code on failure', () => {
    const store = setupStore();
    const { result, unmount } = renderHook(() => useStartGameResponseHandlers(), {
      wrapper: wrapMultiplayerProvider({ store }),
    });

    result.current.startGameErrorResponseHandler({ errorCode: 'test' });

    expect(store.getState().room.roomErrorCode).toEqual('test');

    unmount();
  });
});
