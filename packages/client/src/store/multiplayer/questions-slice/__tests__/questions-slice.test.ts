import { beforeEach, describe, expect, it } from 'vitest';

import type { QuestionsState, ReceivedQuestion } from '@store/multiplayer/questions-slice/questions-slice.types';
import reducer, { addQuestion, updateQuestionsState } from '../questions-slice';

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

  describe('updateQuestions', () => {
    it('should assign new players array', () => {
      const question: ReceivedQuestion = {
        question: 'mock question',
        choices: ['mock choices'],
      };

      expect(reducer(initialState, addQuestion(question))).toEqual({
        ...initialState,
        questions: [question],
      });
    });
  });

  describe('updateQuestionsState', () => {
    it('should set the new state', () => {
      const newState: QuestionsState = {
        questions: [
          {
            question: 'mock question',
            choices: ['mock choice'],
          },
        ],
        questionIndex: 1,
      };

      expect(reducer(initialState, updateQuestionsState(newState))).toEqual(newState);
    });
  });
});
