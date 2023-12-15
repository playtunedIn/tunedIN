import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RedisJSON } from '@redis/json/dist/commands';

import { QUESTIONS_QUERY, QUESTION_INDEX_QUERY, gameStatePublisherClient } from '../../../../../clients/redis';
import { createMockPlayers, createMockPublisherPayload } from '../../../../../testing/mocks/redis-client.mock';
import { REDIS_ERROR_CODES } from '../../../../../errors';
import * as cancelGame from '../../../cancel-game/cancel-game';
import * as endGame from '../../../end-game/end-game';
import { questionRoundResultsHandler } from '../question-round-results';
import { UPDATE_ROUND_RESULTS } from '../../../../responses';
import { ROOM_STATUS } from '../../../../../clients/redis/models/game-state';
import { getRoundLeaderboard } from '../../../../../utils/room-helpers';
import { createMockQuestion, createMockQuestions } from '../../../../../testing/mocks/spotify-client.mock';
import * as questionRound from '../question-round';

describe('Question Round Results Handler', () => {
  const MOCK_ROOM_ID = 'test room id';
  const MOCK_PLAYERS = createMockPlayers();
  const MOCK_QUESTION = createMockQuestion();
  const MOCK_QUESTION_INDEX = 0;

  beforeEach(() => {
    vi.useFakeTimers();

    vi.spyOn(questionRound, 'questionRoundHandler').mockResolvedValue();
    vi.spyOn(endGame, 'endGameHandler').mockResolvedValue();
    vi.spyOn(cancelGame, 'cancelGameHandler').mockResolvedValue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  it('fails when it update redis room status fails', async () => {
    vi.spyOn(gameStatePublisherClient.json, 'set').mockRejectedValueOnce('');

    await questionRoundResultsHandler(MOCK_ROOM_ID, MOCK_PLAYERS, MOCK_QUESTION_INDEX, MOCK_QUESTION);

    expect(cancelGame.cancelGameHandler).toHaveBeenCalledWith(MOCK_ROOM_ID, REDIS_ERROR_CODES.COMMAND_FAILURE);
    expect(gameStatePublisherClient.publish).not.toHaveBeenCalled();
  });

  it('publishes round leaderboard and sets timeout', async () => {
    vi.spyOn(global, 'setTimeout');
    vi.spyOn(gameStatePublisherClient.json, 'set').mockResolvedValueOnce('OK');

    await questionRoundResultsHandler(MOCK_ROOM_ID, MOCK_PLAYERS, MOCK_QUESTION_INDEX, MOCK_QUESTION);

    expect(cancelGame.cancelGameHandler).not.toHaveBeenCalled();
    expect(gameStatePublisherClient.publish).toHaveBeenCalledWith(
      MOCK_ROOM_ID,
      createMockPublisherPayload(UPDATE_ROUND_RESULTS, {
        roomStatus: ROOM_STATUS.SHOW_LEADERBOARD,
        results: getRoundLeaderboard(MOCK_PLAYERS, MOCK_QUESTION_INDEX),
        questionIndex: MOCK_QUESTION_INDEX,
        answers: MOCK_QUESTION.answers,
      })
    );
    expect(global.setTimeout).toHaveBeenCalled();
  });

  describe('Question Round Results Timeout', () => {
    /**
     * Run the pre timeout function should pass every time
     */
    beforeEach(async () => {
      vi.spyOn(global, 'setTimeout');
      vi.spyOn(gameStatePublisherClient.json, 'set').mockResolvedValueOnce('OK');

      await questionRoundResultsHandler(MOCK_ROOM_ID, MOCK_PLAYERS, MOCK_QUESTION_INDEX, MOCK_QUESTION);

      expect(cancelGame.cancelGameHandler).not.toHaveBeenCalled();
      expect(gameStatePublisherClient.publish).toHaveBeenCalledWith(
        MOCK_ROOM_ID,
        createMockPublisherPayload(UPDATE_ROUND_RESULTS, {
          roomStatus: ROOM_STATUS.SHOW_LEADERBOARD,
          results: getRoundLeaderboard(MOCK_PLAYERS, MOCK_QUESTION_INDEX),
          questionIndex: MOCK_QUESTION_INDEX,
          answers: MOCK_QUESTION.answers,
        })
      );
      expect(global.setTimeout).toHaveBeenCalled();
    });

    it('cancels game if timeout redis get fails', async () => {
      vi.spyOn(gameStatePublisherClient.json, 'get').mockRejectedValueOnce('');

      await vi.runOnlyPendingTimersAsync();

      expect(cancelGame.cancelGameHandler).toHaveBeenCalledWith(MOCK_ROOM_ID, REDIS_ERROR_CODES.COMMAND_FAILURE);
    });

    it('cancels game if timeout queries are null', async () => {
      vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce({
        [QUESTIONS_QUERY]: [null],
        [QUESTION_INDEX_QUERY]: [null],
      });

      await vi.runOnlyPendingTimersAsync();

      expect(cancelGame.cancelGameHandler).toHaveBeenCalledWith(MOCK_ROOM_ID, REDIS_ERROR_CODES.KEY_NOT_FOUND);
    });

    it('cancels game if timeout fails to update question index', async () => {
      vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce({
        [QUESTIONS_QUERY]: [createMockQuestions()],
        [QUESTION_INDEX_QUERY]: [MOCK_QUESTION_INDEX],
      } as unknown as RedisJSON);
      vi.spyOn(gameStatePublisherClient.json, 'set').mockRejectedValueOnce('');

      await vi.runOnlyPendingTimersAsync();

      expect(cancelGame.cancelGameHandler).toHaveBeenCalledWith(MOCK_ROOM_ID, REDIS_ERROR_CODES.COMMAND_FAILURE);
    });

    it('calls end game handler when all questions answered', async () => {
      vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce({
        [QUESTIONS_QUERY]: [createMockQuestions()],
        [QUESTION_INDEX_QUERY]: [2],
      } as unknown as RedisJSON);
      vi.spyOn(gameStatePublisherClient.json, 'set').mockResolvedValueOnce('OK');

      await vi.runOnlyPendingTimersAsync();

      expect(cancelGame.cancelGameHandler).not.toHaveBeenCalled();
      expect(endGame.endGameHandler).toHaveBeenCalledWith(MOCK_ROOM_ID);
    });

    it('should enter question round if not all questions answered', async () => {
      vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce({
        [QUESTIONS_QUERY]: [createMockQuestions()],
        [QUESTION_INDEX_QUERY]: [MOCK_QUESTION_INDEX],
      } as unknown as RedisJSON);
      vi.spyOn(gameStatePublisherClient.json, 'set').mockResolvedValueOnce('OK');

      await vi.runOnlyPendingTimersAsync();

      expect(cancelGame.cancelGameHandler).not.toHaveBeenCalled();
      expect(questionRound.questionRoundHandler).toHaveBeenCalledWith(MOCK_ROOM_ID);
    });
  });
});
