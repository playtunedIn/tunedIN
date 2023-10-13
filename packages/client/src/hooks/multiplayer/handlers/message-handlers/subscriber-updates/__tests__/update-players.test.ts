import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { setupStore } from '@store/store';
import { wrapMultiplayerProvider } from '@testing/helpers/multiplayer-helpers';
import { useUpdatePlayersHandlers } from '@hooks/multiplayer/handlers/message-handlers/subscriber-updates/update-players';
import type { PlayerState } from '@store/multiplayer/players-slice/players-slice.types';

describe('Update Players Handlers', () => {
  it('should add player', () => {
    const newPlayer: PlayerState = {
      name: 'Joe Smith',
      score: 0,
      answers: [],
    };

    const store = setupStore();
    const { result, unmount } = renderHook(() => useUpdatePlayersHandlers(), {
      wrapper: wrapMultiplayerProvider({ store }),
    });

    result.current.addPlayerHandler({ player: newPlayer });

    expect(store.getState().players.players).toEqual([newPlayer]);

    unmount();
  });
});
