import { beforeEach, describe, expect, it } from 'vitest';

import type { QuestionsState, ReceivedQuestion } from '@store/multiplayer/questions-slice/questions-slice.types';
import reducer, { addQuestion, updateQuestionAnswers, updateQuestionsState } from '../questions-slice';
import { createMockQuestion } from '@testing/helpers/multiplayer-helpers';

describe('Questions Slice', () => {
  let initialState: QuestionsState;
  beforeEach(() => {
    initialState = {
      questions: [],
      questionIndex: 0,
    };
  });

  it('should return initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(initialState);
  });

  describe('addQuestion', () => {
    it('should assign new players array', () => {
      const question: ReceivedQuestion = {
        expirationTimestamp: 100,
        question: 'mock question',
        choices: ['mock choices'],
      };
      const questionIndex = 0;

      expect(reducer(initialState, addQuestion({ question, questionIndex }))).toEqual({
        ...initialState,
        questions: [question],
      });
    });
  });

  describe('updateQuestionAnswers', () => {
    it('should set question answers based on index', () => {
      const mockQuestion = createMockQuestion();
      const mockQuestionIndex = 0;
      const mockAnswers = [1, 2];
      const state = structuredClone(initialState);
      state.questions = [mockQuestion];

      expect(reducer(state, updateQuestionAnswers({ questionIndex: mockQuestionIndex, answers: mockAnswers }))).toEqual(
        {
          ...state,
          questions: [
            {
              ...mockQuestion,
              answers: mockAnswers,
            },
          ],
        }
      );
    });
  });

  describe('updateQuestionsState', () => {
    it('should set the new state', () => {
      const newState: QuestionsState = {
        questions: [
          {
            question: 'mock question',
            choices: ['mock choice'],
            expirationTimestamp: 100,
          },
        ],
        questionIndex: 1,
      };

      expect(reducer(initialState, updateQuestionsState(newState))).toEqual(newState);
    });
  });
});
