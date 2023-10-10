import { beforeEach, describe, expect, it } from 'vitest';

import type { PlayerState, PlayersState } from '@store/multiplayer/players-slice/players-slice.types';
import reducer, { addPlayer, updateHostId, updatePlayers, updatePlayersState } from '../players-slice';

describe('Players Slice', () => {
  let initialState: PlayersState;
  beforeEach(() => {
    initialState = {
      players: [],
      hostId: '',
    };
  });

  it('should return initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(initialState);
  });

  describe('updatePlayers', () => {
    it('should assign new players array', () => {
      const newPlayers: PlayerState[] = [
        {
          name: 'Joe Smith',
          score: 0,
          answers: [],
        },
      ];
      expect(reducer(initialState, updatePlayers(newPlayers))).toEqual({
        ...initialState,
        players: newPlayers,
      });
    });
  });

  describe('updateHostId', () => {
    it('should assign new hostid', () => {
      const newHostId = 'new host';
      expect(reducer(initialState, updateHostId(newHostId))).toEqual({
        ...initialState,
        hostId: newHostId,
      });
    });
  });

  describe('updatePlayersState', () => {
    it('should create a new player state slice', () => {
      const newState: PlayersState = {
        players: [{ name: 'Joe Smith', score: 100, answers: [[1], null] }],
        hostId: 'test',
      };

      expect(reducer(initialState, updatePlayersState(newState))).toEqual(newState);
    });
  });

  describe('addPlayer', () => {
    it('increases players array by one', () => {
      const newPlayer = {
        name: 'Joe Smith',
        score: 0,
        answers: [],
      };
      expect(reducer(initialState, addPlayer(newPlayer))).toEqual({
        ...initialState,
        players: [newPlayer],
      });
    });
  });
});
