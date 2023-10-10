import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { setupStore } from '@store/store';
import { wrapMultiplayerProvider } from '@testing/helpers/multiplayer-helpers';
import { useUpdateRoomHandlers } from '@hooks/multiplayer/handlers/message-handlers/subscriber-updates/update-room';
import { ROOM_STATUS } from '@store/multiplayer/room-slice/room-slice.constants';

describe('Update Players Handlers', () => {
  it('should add player', () => {
    const store = setupStore();
    const { result, unmount } = renderHook(() => useUpdateRoomHandlers(), {
      wrapper: wrapMultiplayerProvider({ store }),
    });

    result.current.updateRoomStatusHandler({ roomStatus: ROOM_STATUS.CANCELED });

    expect(store.getState().room.roomStatus).toEqual(ROOM_STATUS.CANCELED);

    unmount();
  });
});
