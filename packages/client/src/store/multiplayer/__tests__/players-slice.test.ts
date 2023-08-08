import { describe, expect, it } from 'vitest';

import reducer, { updatePlayers } from '../players-slice';

describe('Players Slice', () => {
  it('should return initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual({
      players: [],
    });
  });

  describe('updatePlayers', () => {
    it('should assign new players array', () => {
      const initialState = { players: [] };
      expect(reducer(initialState, updatePlayers(['player']))).toEqual({
        players: ['player'],
      });
    });
  });
});
