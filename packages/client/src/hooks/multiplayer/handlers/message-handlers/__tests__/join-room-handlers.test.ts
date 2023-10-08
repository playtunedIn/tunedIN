import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

import { wrapMultiplayerProvider } from '@testing/helpers/multiplayer-helpers';
import { setupStore } from '@store/store';
import { ROOM_STATUS } from '@store/multiplayer/room-slice/room-slice.constants';
import { useJoinRoomResponseHandlers, type JoinRoomResponse } from '../join-room-handlers';

describe('Join Room Handlers', () => {
  const mockJoinRoomResponse: JoinRoomResponse = {
    roomId: 'test',
    hostId: '',
    roomStatus: ROOM_STATUS.LOBBY,
    players: [],
    questionIndex: 0,
    questions: [],
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('dispatches setting new game properties', () => {
    const store = setupStore();
    const { result, unmount } = renderHook(() => useJoinRoomResponseHandlers(), {
      wrapper: wrapMultiplayerProvider({ store }),
    });

    result.current.joinRoomResponseHandler(mockJoinRoomResponse);

    expect(store.getState().room).toEqual({
      roomId: mockJoinRoomResponse.roomId,
      roomStatus: mockJoinRoomResponse.roomStatus,
    });
    expect(store.getState().players).toEqual({
      players: mockJoinRoomResponse.players,
      hostId: mockJoinRoomResponse.hostId,
    });
    expect(store.getState().questions).toEqual({
      questions: mockJoinRoomResponse.questions,
      questionIndex: mockJoinRoomResponse.questionIndex,
    });

    unmount();
  });

  it('updates room error code on failure', () => {
    const store = setupStore();
    const { result, unmount } = renderHook(() => useJoinRoomResponseHandlers(), {
      wrapper: wrapMultiplayerProvider({ store }),
    });

    result.current.joinRoomErrorResponseHandler({ errorCode: 'test' });

    expect(store.getState().room.roomErrorCode).toEqual('test');

    unmount();
  });
});
