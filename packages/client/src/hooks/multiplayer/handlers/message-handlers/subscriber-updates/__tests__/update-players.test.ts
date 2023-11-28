import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { setupStore } from '@store/store';
import { createMockPlayer, createMockQuestion, wrapMultiplayerProvider } from '@testing/helpers/multiplayer-helpers';
import { useUpdatePlayersHandlers } from '@hooks/multiplayer/handlers/message-handlers/subscriber-updates/update-players';
import { addPlayer } from '@store/multiplayer/players-slice/players-slice';
import { addQuestion } from '@store/multiplayer/questions-slice/questions-slice';
import { ROOM_STATUS } from '@store/multiplayer/room-slice/room-slice.constants';
import type { PlayerState } from '@store/multiplayer/players-slice/players-slice.types';

describe('Update Players Handlers', () => {
  it('should add player', () => {
    const newPlayer = createMockPlayer();

    const store = setupStore();
    const { result, unmount } = renderHook(() => useUpdatePlayersHandlers(), {
      wrapper: wrapMultiplayerProvider({ store }),
    });

    result.current.addPlayerHandler({ player: newPlayer });

    expect(store.getState().players.players).toEqual([newPlayer]);

    unmount();
  });

  it('should indicate player has answered question', () => {
    const newPlayer = createMockPlayer();
    const store = setupStore();
    store.dispatch(addPlayer(newPlayer));

    const { result, unmount } = renderHook(() => useUpdatePlayersHandlers(), {
      wrapper: wrapMultiplayerProvider({ store }),
    });

    result.current.playerAnsweredQuestionHandler({ name: newPlayer.name });

    expect(store.getState().players.players[0].answeredCurrentQuestion).toEqual(true);

    unmount();
  });

  it('updates everyone scores once the question round ends', () => {
    const mockQuestion = createMockQuestion();
    const mockPlayer = createMockPlayer();
    const mockQuestionIndex = 0;
    const mockAnswers = [0];

    const store = setupStore();
    store.dispatch(addPlayer(mockPlayer));
    store.dispatch(addQuestion({ question: mockQuestion, questionIndex: mockQuestionIndex }));

    const { result, unmount } = renderHook(() => useUpdatePlayersHandlers(), {
      wrapper: wrapMultiplayerProvider({ store }),
    });

    result.current.updateRoundResultsHandler({
      roomStatus: ROOM_STATUS.SHOW_LEADERBOARD,
      questionIndex: mockQuestionIndex,
      answers: mockAnswers,
      results: [
        {
          name: mockPlayer.name,
          score: 100,
          answers: null,
        },
      ],
    });

    const expectedPlayerState: PlayerState = {
      name: mockPlayer.name,
      score: 100,
      answers: [null],
      answeredCurrentQuestion: false,
    };

    expect(store.getState().room.roomStatus).toEqual(ROOM_STATUS.SHOW_LEADERBOARD);
    expect(store.getState().questions.questions[mockQuestionIndex].answers).toEqual(mockAnswers);
    expect(store.getState().players.players[0]).toEqual(expectedPlayerState);

    unmount();
  });
});
