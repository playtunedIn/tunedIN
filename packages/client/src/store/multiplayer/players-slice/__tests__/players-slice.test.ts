import { beforeEach, describe, expect, it } from 'vitest';

import type {
  PlayerState,
  PlayersState,
  ReceivedPlayersState,
  RoundResults,
} from '@store/multiplayer/players-slice/players-slice.types';
import reducer, {
  addPlayer,
  answerQuestion,
  resetPlayersAnsweredQuestion,
  setName,
  updateHostId,
  updatePlayerAnsweredQuestion,
  updatePlayersScore,
  updatePlayersState,
} from '../players-slice';
import { createMockPlayer } from '@testing/helpers/multiplayer-helpers';

describe('Players Slice', () => {
  let initialState: PlayersState;
  beforeEach(() => {
    initialState = {
      name: '',
      players: [],
      hostId: '',
    };
  });

  it('should return initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(initialState);
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
      const newState: ReceivedPlayersState = {
        players: [{ name: 'Joe Smith', score: 100, answers: [[1], null] }],
        hostId: 'test',
      };

      expect(reducer(initialState, updatePlayersState(newState))).toEqual({
        ...newState,
        name: '',
        players: [{ ...newState.players[0], answeredCurrentQuestion: false }],
      });
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
        name: '',
        players: [{ ...newPlayer, answeredCurrentQuestion: false }],
      });
    });
  });

  it("sets player's name", () => {
    const mockName = 'Joe';
    expect(reducer(initialState, setName(mockName))).toEqual({
      ...initialState,
      name: mockName,
    });
  });

  it('resets players who have answered question', () => {
    const state = structuredClone(initialState);
    const mockPlayer: PlayerState = { ...createMockPlayer(), answeredCurrentQuestion: true };
    state.players = [mockPlayer];

    expect(reducer(state, resetPlayersAnsweredQuestion())).toEqual({
      ...state,
      players: [{ ...mockPlayer, answeredCurrentQuestion: false }],
    });
  });

  it('updates state when player answers question', () => {
    const state = structuredClone(initialState);
    const mockPlayer: PlayerState = { ...createMockPlayer(), answeredCurrentQuestion: false };
    state.players = [mockPlayer];
    state.name = mockPlayer.name;

    const mockQuestionIndex = 0;
    const mockAnswerIndexes = [1, 2];

    expect(
      reducer(state, answerQuestion({ questionIndex: mockQuestionIndex, answerIndexes: mockAnswerIndexes }))
    ).toEqual({
      ...state,
      players: [{ ...mockPlayer, answers: [mockAnswerIndexes], answeredCurrentQuestion: true }],
    });
  });

  it('updates everyone score', () => {
    const state = structuredClone(initialState);
    const mockPlayer: PlayerState = { ...createMockPlayer(), answeredCurrentQuestion: true };
    state.players = [mockPlayer];

    const mockRoundResults: RoundResults = {
      questionIndex: 0,
      results: [
        {
          name: mockPlayer.name,
          score: 55,
          answers: null,
        },
      ],
    };

    expect(reducer(state, updatePlayersScore(mockRoundResults))).toEqual({
      ...state,
      players: [{ ...mockPlayer, answers: [null], score: 55, answeredCurrentQuestion: true }],
    });
  });

  it('updates when another player answers a question', () => {
    const state = structuredClone(initialState);
    const mockPlayer: PlayerState = { ...createMockPlayer(), answeredCurrentQuestion: false };
    state.players = [mockPlayer];

    expect(reducer(state, updatePlayerAnsweredQuestion(mockPlayer.name))).toEqual({
      ...state,
      players: [{ ...mockPlayer, answeredCurrentQuestion: true }],
    });
  });
});
