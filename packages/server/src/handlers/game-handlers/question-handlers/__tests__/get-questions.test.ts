import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createMockQuestions } from '../../../../testing/mocks/spotify-client.mock';
import { gameStatePublisherClient } from '../../../../clients/redis';
import { REDIS_ERROR_CODES, START_GAME_ERROR_CODES } from '../../../../errors';
import * as spotifyClient from '../../../../clients/spotify/spotify-client';
import * as cancelGameHandler from '../../cancel-game/cancel-game';
import * as questionRoundHandler from '../question-round/question-round';
import { getQuestionsHandler } from '../get-questions';

describe('Get Questions Handler', () => {
  const mockRoomId = 'test room id';

  beforeEach(() => {
    vi.spyOn(questionRoundHandler, 'questionRoundHandler');
    vi.spyOn(cancelGameHandler, 'cancelGameHandler');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should cancel game if getQuestions fails', async () => {
    vi.spyOn(spotifyClient, 'getQuestions').mockRejectedValueOnce('');

    await getQuestionsHandler(mockRoomId);

    expect(cancelGameHandler.cancelGameHandler).toHaveBeenCalledWith(
      mockRoomId,
      START_GAME_ERROR_CODES.GET_QUESTIONS_FAILED
    );
    expect(questionRoundHandler.questionRoundHandler).not.toHaveBeenCalled();
  });

  it('should cancel game if redis update questions array fails', async () => {
    vi.spyOn(spotifyClient, 'getQuestions').mockResolvedValueOnce(createMockQuestions());
    vi.spyOn(gameStatePublisherClient.json, 'set').mockRejectedValueOnce('');

    await getQuestionsHandler(mockRoomId);

    expect(cancelGameHandler.cancelGameHandler).toHaveBeenLastCalledWith(mockRoomId, REDIS_ERROR_CODES.COMMAND_FAILURE);
    expect(questionRoundHandler.questionRoundHandler).not.toHaveBeenCalled();
  });

  it('should start question round handler', async () => {
    vi.spyOn(spotifyClient, 'getQuestions').mockResolvedValueOnce(createMockQuestions());
    vi.spyOn(gameStatePublisherClient.json, 'set').mockResolvedValueOnce('OK');

    await getQuestionsHandler(mockRoomId);

    expect(cancelGameHandler.cancelGameHandler).not.toHaveBeenCalled();
    expect(questionRoundHandler.questionRoundHandler).toHaveBeenCalledWith(mockRoomId);
  });
});
