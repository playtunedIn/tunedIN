import { describe, expect, it } from 'vitest';

import reducer, { updateQuestions } from '../questions-slice';

describe('Questions Slice', () => {
  it('should return initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual({
      questions: [],
    });
  });

  describe('updateQuestions', () => {
    it('should assign new players array', () => {
      const initialState = { questions: [] };
      expect(reducer(initialState, updateQuestions(['question']))).toEqual({
        questions: ['question'],
      });
    });
  });
});
