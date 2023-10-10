import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';

import { wrapMultiplayerProvider } from '@testing/helpers/multiplayer-helpers';
import { WebSocketWrapper as MockWebSocketWrapper } from '../websocket-wrapper';
import { useMultiplayerClient } from '..';
import { createMockWebSocketMessage } from '@testing/mocks/mock-websocket';
import {
  ANSWER_QUESTION_MESSAGE,
  CREATE_ROOM_MESSAGE,
  JOIN_ROOM_MESSAGE,
} from '@hooks/multiplayer/handlers/socket-handlers.constants';
import { setupStore } from '@store/store';

describe('Multiplayer Client', () => {
  it('should send createRoom message', () => {
    const resultStr = createMockWebSocketMessage(CREATE_ROOM_MESSAGE);
    const { result, unmount } = renderHook(() => useMultiplayerClient(), { wrapper: wrapMultiplayerProvider() });

    result.current.createRoom();

    expect(MockWebSocketWrapper.prototype.send).toHaveBeenCalledWith(resultStr);
    unmount();
  });

  it('should send exitRoom message', () => {
    const { result, unmount } = renderHook(() => useMultiplayerClient(), { wrapper: wrapMultiplayerProvider() });

    result.current.exitRoom();

    expect(MockWebSocketWrapper.prototype.close).toHaveBeenCalled();
    unmount();
  });

  it('should send joinRoom message', () => {
    const mockRoomId = 'test';
    const mockName = 'Joe';

    const store = setupStore();
    const { result, unmount } = renderHook(() => useMultiplayerClient(), {
      wrapper: wrapMultiplayerProvider({ store }),
    });

    result.current.joinRoom(mockRoomId, mockName);

    expect(MockWebSocketWrapper.prototype.send).toHaveBeenCalledWith(
      createMockWebSocketMessage(JOIN_ROOM_MESSAGE, { roomId: mockRoomId, name: mockName })
    );
    expect(store.getState().players.name).toEqual(mockName);
    unmount();
  });

  it('should send answerQuestion message', () => {
    const mockRoomId = 'test';
    const mockAnswerIndexes = [2];
    const mockQuestionIndex = 3;
    const { result, unmount } = renderHook(() => useMultiplayerClient(), { wrapper: wrapMultiplayerProvider() });

    result.current.answerQuestion(mockRoomId, mockAnswerIndexes, mockQuestionIndex);

    expect(MockWebSocketWrapper.prototype.send).toHaveBeenCalledWith(
      createMockWebSocketMessage(ANSWER_QUESTION_MESSAGE, {
        roomId: mockRoomId,
        answerIndexes: mockAnswerIndexes,
        questionIndex: mockQuestionIndex,
      })
    );
    unmount();
  });
});
