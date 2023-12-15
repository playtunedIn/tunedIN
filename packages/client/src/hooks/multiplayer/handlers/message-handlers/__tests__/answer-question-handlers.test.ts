import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

import { createMockPlayer, createMockQuestion, wrapMultiplayerProvider } from '@testing/helpers/multiplayer-helpers';
import { setupStore } from '@store/store';
import { useAnswerQuestionResponseHandlers } from '@hooks/multiplayer/handlers/message-handlers/answer-question-handlers';
import { addQuestion } from '@store/multiplayer/questions-slice/questions-slice';
import { addPlayer, setName } from '@store/multiplayer/players-slice/players-slice';

describe('Create Room Handlers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sets player's answers", () => {
    const mockPlayer = createMockPlayer();
    const mockQuestion = createMockQuestion();
    const mockQuestionIndex = 0;
    const mockAnswerIndexes = [3];

    // Setup a store that has a question and a player in it
    const store = setupStore();
    store.dispatch(addQuestion({ question: mockQuestion, questionIndex: mockQuestionIndex }));
    store.dispatch(addPlayer(mockPlayer));
    store.dispatch(setName(mockPlayer.name));

    const { result, unmount } = renderHook(() => useAnswerQuestionResponseHandlers(), {
      wrapper: wrapMultiplayerProvider({ store }),
    });

    result.current.answerQuestionResponseHandler({
      questionIndex: mockQuestionIndex,
      answerIndexes: mockAnswerIndexes,
    });

    expect(store.getState().players.players[0].answers[mockQuestionIndex]).toEqual(mockAnswerIndexes);

    unmount();
  });

  it('updates error code on failure', () => {
    const store = setupStore();
    const { result, unmount } = renderHook(() => useAnswerQuestionResponseHandlers(), {
      wrapper: wrapMultiplayerProvider({ store }),
    });

    result.current.answerQuestionErrorResponseHandler({ errorCode: 'test' });

    expect(store.getState().room.roomErrorCode).toEqual('test');

    unmount();
  });
});
