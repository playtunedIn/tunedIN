import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RedisJSON } from '@redis/json/dist/commands';

import { QUESTIONS_QUERY, QUESTION_INDEX_QUERY, gameStatePublisherClient } from '../../../../../clients/redis';
import { ROOM_STATUS } from '../../../../../clients/redis/models/game-state';
import { REDIS_ERROR_CODES } from '../../../../../errors';
import { createMockQuestions } from '../../../../../testing/mocks/spotify-client.mock';
import { createMockPlayers, createMockPublisherPayload } from '../../../../../testing/mocks/redis-client.mock';
import { UPDATE_ROOM_STATUS_RESPONSE } from '../../../../responses';
import * as cancelGame from '../../../cancel-game/cancel-game';
import * as questionRoundResults from '../question-round-results';
import { QUESTION_ROUND_TIME_LIMIT, questionRoundHandler } from '../question-round';

describe('Question Round Handler', () => {
  const MOCK_ROOM_ID = 'test room id';
  const MOCK_QUESTION_INDEX = 0;
  const MOCK_CURRENT_TIME = new Date(1997, 2, 16);

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_CURRENT_TIME);

    vi.spyOn(cancelGame, 'cancelGameHandler').mockResolvedValue();
    vi.spyOn(questionRoundResults, 'questionRoundResultsHandler').mockResolvedValue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  it('cancels game if when get questions/index fails', async () => {
    vi.spyOn(gameStatePublisherClient.json, 'get').mockRejectedValueOnce('');

    await questionRoundHandler(MOCK_ROOM_ID);

    expect(cancelGame.cancelGameHandler).toHaveBeenCalledWith(MOCK_ROOM_ID, REDIS_ERROR_CODES.COMMAND_FAILURE);
  });

  it('cancels game if question/index keys not found', async () => {
    vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce({
      [QUESTIONS_QUERY]: [null],
      [QUESTION_INDEX_QUERY]: [null],
    });

    await questionRoundHandler(MOCK_ROOM_ID);

    expect(cancelGame.cancelGameHandler).toHaveBeenCalledWith(MOCK_ROOM_ID, REDIS_ERROR_CODES.KEY_NOT_FOUND);
  });

  it('cancels game if update question expiration fails', async () => {
    vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce({
      [QUESTIONS_QUERY]: [createMockQuestions()],
      [QUESTION_INDEX_QUERY]: [MOCK_QUESTION_INDEX],
    } as unknown as RedisJSON);
    vi.spyOn(gameStatePublisherClient.json, 'set').mockRejectedValueOnce('');

    await questionRoundHandler(MOCK_ROOM_ID);

    expect(cancelGame.cancelGameHandler).toHaveBeenCalledWith(MOCK_ROOM_ID, REDIS_ERROR_CODES.COMMAND_FAILURE);
  });

  it('publishes question and sets round timeout', async () => {
    vi.spyOn(global, 'setTimeout');

    const questions = createMockQuestions();
    vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce({
      [QUESTIONS_QUERY]: [questions],
      [QUESTION_INDEX_QUERY]: [MOCK_QUESTION_INDEX],
    } as unknown as RedisJSON);
    vi.spyOn(gameStatePublisherClient.json, 'set').mockResolvedValueOnce('OK');

    await questionRoundHandler(MOCK_ROOM_ID);

    expect(gameStatePublisherClient.publish).toHaveBeenCalledWith(
      MOCK_ROOM_ID,
      createMockPublisherPayload(UPDATE_ROOM_STATUS_RESPONSE, {
        roomStatus: ROOM_STATUS.IN_QUESTION,
        question: {
          question: questions[MOCK_QUESTION_INDEX].question,
          choices: questions[MOCK_QUESTION_INDEX].choices,
          expirationTimestamp: MOCK_CURRENT_TIME.getTime() + QUESTION_ROUND_TIME_LIMIT,
        },
      })
    );
    expect(global.setTimeout).toHaveBeenCalled();
  });

  describe('Question Round Timeout', () => {
    beforeEach(async () => {
      vi.spyOn(global, 'setTimeout');

      const questions = createMockQuestions();
      vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce({
        [QUESTIONS_QUERY]: [questions],
        [QUESTION_INDEX_QUERY]: [MOCK_QUESTION_INDEX],
      } as unknown as RedisJSON);
      vi.spyOn(gameStatePublisherClient.json, 'set').mockResolvedValueOnce('OK');

      await questionRoundHandler(MOCK_ROOM_ID);

      expect(gameStatePublisherClient.publish).toHaveBeenCalledWith(
        MOCK_ROOM_ID,
        createMockPublisherPayload(UPDATE_ROOM_STATUS_RESPONSE, {
          roomStatus: ROOM_STATUS.IN_QUESTION,
          question: {
            question: questions[MOCK_QUESTION_INDEX].question,
            choices: questions[MOCK_QUESTION_INDEX].choices,
            expirationTimestamp: MOCK_CURRENT_TIME.getTime() + QUESTION_ROUND_TIME_LIMIT,
          },
        })
      );
      expect(global.setTimeout).toHaveBeenCalled();
    });

    it('cancels game when get players in timeout fails', async () => {
      vi.spyOn(gameStatePublisherClient.json, 'get').mockRejectedValueOnce('');

      await vi.runOnlyPendingTimersAsync();

      expect(cancelGame.cancelGameHandler).toHaveBeenCalledWith(MOCK_ROOM_ID, REDIS_ERROR_CODES.COMMAND_FAILURE);
    });

    it('cancels game when get players in timeout key is not found', async () => {
      vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce([null]);

      await vi.runOnlyPendingTimersAsync();

      expect(cancelGame.cancelGameHandler).toHaveBeenCalledWith(MOCK_ROOM_ID, REDIS_ERROR_CODES.KEY_NOT_FOUND);
    });

    it('does not call round result handler in timeout when all players have answered question', async () => {
      const players = createMockPlayers();
      players.forEach(player => (player.answers[MOCK_QUESTION_INDEX] = 1));
      vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce([players] as any);

      await vi.runOnlyPendingTimersAsync();

      expect(cancelGame.cancelGameHandler).not.toHaveBeenCalled();
      expect(questionRoundResults.questionRoundResultsHandler).not.toHaveBeenCalled();
    });

    it('calls round results handler in timeout if not all players have answered question', async () => {
      const players = createMockPlayers();
      vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce([players] as any);

      await vi.runOnlyPendingTimersAsync();

      expect(cancelGame.cancelGameHandler).not.toHaveBeenCalled();
      expect(questionRoundResults.questionRoundResultsHandler).toHaveBeenCalledWith(
        MOCK_ROOM_ID,
        players,
        MOCK_QUESTION_INDEX
      );
    });
  });
});
