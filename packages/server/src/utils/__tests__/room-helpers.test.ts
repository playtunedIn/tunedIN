import { beforeEach, describe, expect, it } from 'vitest';

import type { Question } from 'src/clients/redis/models/game-state';
import { createMockQuestion } from '../../testing/mocks/spotify-client.mock';
import { areValidAnswers, calculateScore } from '../room-helpers';

describe('Room Helpers', () => {
  describe('calculateScore', () => {
    const MOCK_QUESTION_EXPIRATION_TIME = 1000;
    const MOCK_CURRENT_TIME = 100;
    const MOCK_QUESTION_ANSWERS = [0, 1];

    it('returns 0 if no correct answers', () => {
      expect(calculateScore(MOCK_QUESTION_EXPIRATION_TIME, MOCK_CURRENT_TIME, MOCK_QUESTION_ANSWERS, [3, 2])).toEqual(
        0
      );
    });

    it('returns score based on correct answers', () => {
      expect(calculateScore(MOCK_QUESTION_EXPIRATION_TIME, MOCK_CURRENT_TIME, MOCK_QUESTION_ANSWERS, [2, 0])).toEqual(
        90
      );
    });
  });

  describe('areValidAnswers', () => {
    let MOCK_QUESTION: Question;
    beforeEach(() => {
      MOCK_QUESTION = createMockQuestion();
    });

    it('returns false if answers array is empty', () => {
      expect(areValidAnswers([], MOCK_QUESTION)).toEqual(false);
    });

    it('returns false if answers array is larger than choices array', () => {
      expect(areValidAnswers([0, 1, 2, 3, 4, 5], MOCK_QUESTION)).toEqual(false);
    });

    it('returns false when an answer is not in the range of choices indexes', () => {
      expect(areValidAnswers([MOCK_QUESTION.choices.length], MOCK_QUESTION)).toEqual(false);
    });

    it('returns false when a player uses the same answer multiple times', () => {
      MOCK_QUESTION.answers = [0, 1, 2];

      expect(areValidAnswers([1, 2, 1], MOCK_QUESTION)).toEqual(false);
    });

    it("returns true when a player's answers meet the valid criteria", () => {
      expect(areValidAnswers([3], MOCK_QUESTION)).toEqual(true);
    });
  });
});
