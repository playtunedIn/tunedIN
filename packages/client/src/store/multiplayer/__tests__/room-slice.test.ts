import { beforeEach, describe, expect, it } from 'vitest';

import type { RoomState } from '../room-slice';
import reducer, { updateRoomErrorCode, updateRoomId, updateRoomState } from '../room-slice';

describe('Room Slice', () => {
  let initialState: RoomState;
  beforeEach(() => {
    initialState = {
      roomId: '',
    };
  });

  it('should return initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual({
      roomId: '',
    });
  });

  describe('updateRoomId', () => {
    it('should assign new roomId', () => {
      expect(reducer(initialState, updateRoomId('new room'))).toEqual({
        roomId: 'new room',
      });
    });
  });

  describe('updateErrorCode', () => {
    it('should assign new error code', () => {
      expect(reducer(initialState, updateRoomErrorCode('new error code'))).toEqual({
        roomId: '',
        roomErrorCode: 'new error code',
      });
    });
  });

  describe('updateRoomState', () => {
    it('should assign an entirely new state', () => {
      expect(reducer(initialState, updateRoomState({ roomId: 'new room', roomErrorCode: 'new error code' }))).toEqual({
        roomId: 'new room',
        roomErrorCode: 'new error code',
      });
    });
  });
});
