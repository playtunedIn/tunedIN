import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

import type { CreateRoomResponse } from '../create-room-handlers';
import { useCreateRoomResponseHandlers } from '../create-room-handlers';
import { wrapMultiplayerProvider } from '@testing/helpers/multiplayer-helpers';
import { setupStore } from '@store/store';
import { ROOM_STATUS } from '@store/multiplayer/room-slice/room-slice.constants';

describe('Create Room Handlers', () => {
  const mockCreateRoomResponse: CreateRoomResponse = {
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
    const { result, unmount } = renderHook(() => useCreateRoomResponseHandlers(), {
      wrapper: wrapMultiplayerProvider({ store }),
    });

    result.current.createRoomResponseHandler(mockCreateRoomResponse);

    expect(store.getState().room).toEqual({
      roomId: mockCreateRoomResponse.roomId,
      roomStatus: mockCreateRoomResponse.roomStatus,
    });
    expect(store.getState().players).toEqual({
      players: mockCreateRoomResponse.players,
      hostId: mockCreateRoomResponse.hostId,
    });
    expect(store.getState().questions).toEqual({
      questions: mockCreateRoomResponse.questions,
      questionIndex: mockCreateRoomResponse.questionIndex,
    });

    unmount();
  });

  it('updates room error code on failure', () => {
    const store = setupStore();
    const { result, unmount } = renderHook(() => useCreateRoomResponseHandlers(), {
      wrapper: wrapMultiplayerProvider({ store }),
    });

    result.current.createRoomErrorResponseHandler({ errorCode: 'test' });

    expect(store.getState().room.roomErrorCode).toEqual('test');

    unmount();
  });
});
