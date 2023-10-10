import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { setupStore } from '@store/store';
import { createMockPlayer, createMockQuestion, wrapMultiplayerProvider } from '@testing/helpers/multiplayer-helpers';
import { ROOM_STATUS } from '@store/multiplayer/room-slice/room-slice.constants';
import { useUpdateQuestionsHandlers } from '@hooks/multiplayer/handlers/message-handlers/subscriber-updates/update-questions';
import { addPlayer } from '@store/multiplayer/players-slice/players-slice';

describe('Update Questions Handlers', () => {
  it('should reset question for new round', () => {
    const mockPlayer = createMockPlayer();
    mockPlayer.answeredCurrentQuestion = true;
    const store = setupStore();
    store.dispatch(addPlayer(mockPlayer));

    const { result, unmount } = renderHook(() => useUpdateQuestionsHandlers(), {
      wrapper: wrapMultiplayerProvider({ store }),
    });

    const mockQuestion = createMockQuestion();
    const mockQuesitonIndex = 0;

    result.current.updateCurrentQuestionHandler({
      roomStatus: ROOM_STATUS.IN_QUESTION,
      questionIndex: mockQuesitonIndex,
      question: mockQuestion,
    });

    expect(store.getState().questions.questions).toEqual([mockQuestion]);
    expect(store.getState().questions.questionIndex).toEqual(mockQuesitonIndex);
    expect(store.getState().room.roomStatus).toEqual(ROOM_STATUS.IN_QUESTION);

    store.getState().players.players.forEach(player => {
      expect(player.answeredCurrentQuestion).toEqual(false);
    });

    unmount();
  });
});
