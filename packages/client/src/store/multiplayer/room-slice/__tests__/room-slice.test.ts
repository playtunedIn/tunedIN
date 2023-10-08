import { beforeEach, describe, expect, it } from 'vitest';

import type { RoomState } from '../room-slice.types';
import reducer, { updateRoomErrorCode, updateRoomId, updateRoomState } from '../room-slice';
import { ROOM_STATUS } from '@store/multiplayer/room-slice/room-slice.constants';

describe('Room Slice', () => {
  let initialState: RoomState;
  beforeEach(() => {
    initialState = {
      roomId: '',
      roomStatus: ROOM_STATUS.NOT_IN_ROOM,
    };
  });

  it('should return initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(initialState);
  });

  describe('updateRoomId', () => {
    it('should assign new roomId', () => {
      expect(reducer(initialState, updateRoomId('new room'))).toEqual({
        ...initialState,
        roomId: 'new room',
      });
    });
  });

  describe('updateErrorCode', () => {
    it('should assign new error code', () => {
      expect(reducer(initialState, updateRoomErrorCode('new error code'))).toEqual({
        ...initialState,
        roomErrorCode: 'new error code',
      });
    });
  });

  describe('updateRoomState', () => {
    it('should assign an entirely new state', () => {
      const newState: RoomState = { roomId: 'new room', roomStatus: ROOM_STATUS.IN_QUESTION };
      expect(reducer(initialState, updateRoomState(newState))).toEqual(newState);
    });
  });
});
