import { describe, expect, it } from 'vitest';
import * as questionGeneratingService from '../question-generating-service';
import { users } from '../../testing/mocks/question-generating-service/users';

describe('Question generating service', () => {
  it('should generate the number of question results requested', () => {
    const result = questionGeneratingService.getGameQuestions(users, 4);
    expect(result).toHaveLength(4);
  });

  it('should generate the max number of available questions if requested more questions than available', () => {
    const result = questionGeneratingService.getGameQuestions(users, 8);
    expect(result).toHaveLength(5);
  });
});
