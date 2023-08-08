import { describe, expect, it } from 'vitest';

import reducer, { updateRoomId } from '../room-slice';

describe('Room Slice', () => {
  it('should return initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual({
      roomId: '',
    });
  });

  describe('updateRoomId', () => {
    it('should assign new roomId', () => {
      const initialState = { roomId: '' };
      expect(reducer(initialState, updateRoomId('new room'))).toEqual({
        roomId: 'new room',
      });
    });
  });
});
