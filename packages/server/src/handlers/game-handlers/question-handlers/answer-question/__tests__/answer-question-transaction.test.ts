import type { RedisJSON } from '@redis/json/dist/commands';
import { describe, expect, it, vi } from 'vitest';

import { GLOBAL_MOCK_USER_ID } from '../../../../../testing/mocks/auth.mock';
import { createMockPlayers, mockMultiCommand } from '../../../../../testing/mocks/redis-client.mock';
import { createMockQuestion } from '../../../../../testing/mocks/spotify-client.mock';
import { QUESTION_ROUND_ERROR_CODES, REDIS_ERROR_CODES } from '../../../../../errors';
import { gameStatePublisherClient } from '../../../../../clients/redis';
import { answerQuestionTransaction } from '../answer-question-transaction';
import { calculateScore } from 'src/utils/room-helpers';

describe('Answer Question Transaction', () => {
  const MOCK_ROOM_ID = 'test room id';
  const MOCK_USER_ID = GLOBAL_MOCK_USER_ID;
  const MOCK_QUESTION_INDEX = 0;
  const MOCK_ANSWER_INDEX = 0;
  const MOCK_ANSWER_TIMESTAMP = 5000;

  it('fails when redis get fails', async () => {
    vi.spyOn(gameStatePublisherClient.json, 'get').mockRejectedValueOnce('');

    await expect(() =>
      answerQuestionTransaction(
        MOCK_ROOM_ID,
        MOCK_USER_ID,
        MOCK_QUESTION_INDEX,
        MOCK_ANSWER_INDEX,
        MOCK_ANSWER_TIMESTAMP
      )
    ).rejects.toThrowError(REDIS_ERROR_CODES.COMMAND_FAILURE);
  });

  it('fails when key(s) not found', async () => {
    vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce({
      [`$.questions[${MOCK_QUESTION_INDEX}]`]: [null],
      ['$.players']: [null],
    });

    await expect(() =>
      answerQuestionTransaction(
        MOCK_ROOM_ID,
        MOCK_USER_ID,
        MOCK_QUESTION_INDEX,
        MOCK_ANSWER_INDEX,
        MOCK_ANSWER_TIMESTAMP
      )
    ).rejects.toThrowError(REDIS_ERROR_CODES.KEY_NOT_FOUND);
  });

  it('fails when answer choice is out of range', async () => {
    const question = createMockQuestion();
    vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce({
      [`$.questions[${MOCK_QUESTION_INDEX}]`]: [question],
      ['$.players']: [createMockPlayers()],
    } as unknown as RedisJSON);

    await expect(() =>
      answerQuestionTransaction(
        MOCK_ROOM_ID,
        MOCK_USER_ID,
        MOCK_QUESTION_INDEX,
        question.choices.length,
        MOCK_ANSWER_TIMESTAMP
      )
    ).rejects.toThrowError(QUESTION_ROUND_ERROR_CODES.ANSWER_OUT_OF_RANGE);
  });

  it('fails when expiration for question is not set (round not started)', async () => {
    const question = createMockQuestion();
    vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce({
      [`$.questions[${MOCK_QUESTION_INDEX}]`]: [question],
      ['$.players']: [createMockPlayers()],
    } as unknown as RedisJSON);

    await expect(() =>
      answerQuestionTransaction(
        MOCK_ROOM_ID,
        MOCK_USER_ID,
        MOCK_QUESTION_INDEX,
        MOCK_ANSWER_INDEX,
        MOCK_ANSWER_TIMESTAMP
      )
    ).rejects.toThrowError(QUESTION_ROUND_ERROR_CODES.QUESTION_NOT_STARTED);
  });

  it('fails when expiration for question is not set (round not started)', async () => {
    const question = createMockQuestion();
    question.expirationTimestamp = MOCK_ANSWER_TIMESTAMP - 1;
    vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce({
      [`$.questions[${MOCK_QUESTION_INDEX}]`]: [question],
      ['$.players']: [createMockPlayers()],
    } as unknown as RedisJSON);

    await expect(() =>
      answerQuestionTransaction(
        MOCK_ROOM_ID,
        MOCK_USER_ID,
        MOCK_QUESTION_INDEX,
        MOCK_ANSWER_INDEX,
        MOCK_ANSWER_TIMESTAMP
      )
    ).rejects.toThrowError(QUESTION_ROUND_ERROR_CODES.QUESTION_EXPIRED);
  });

  it('fails when answering player is not in room', async () => {
    const question = createMockQuestion();
    question.expirationTimestamp = MOCK_ANSWER_TIMESTAMP;
    vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce({
      [`$.questions[${MOCK_QUESTION_INDEX}]`]: [question],
      ['$.players']: [createMockPlayers()],
    } as unknown as RedisJSON);

    await expect(() =>
      answerQuestionTransaction(
        MOCK_ROOM_ID,
        'NOT A MATCHING USER ID',
        MOCK_QUESTION_INDEX,
        MOCK_ANSWER_INDEX,
        MOCK_ANSWER_TIMESTAMP
      )
    ).rejects.toThrowError(QUESTION_ROUND_ERROR_CODES.PLAYER_NOT_FOUND);
  });

  it('fails when player already answered question', async () => {
    const question = createMockQuestion();
    question.expirationTimestamp = MOCK_ANSWER_TIMESTAMP;
    const players = createMockPlayers();
    players[0].answers = [MOCK_ANSWER_INDEX];

    vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce({
      [`$.questions[${MOCK_QUESTION_INDEX}]`]: [question],
      ['$.players']: [players],
    } as unknown as RedisJSON);

    await expect(() =>
      answerQuestionTransaction(
        MOCK_ROOM_ID,
        MOCK_USER_ID,
        MOCK_QUESTION_INDEX,
        MOCK_ANSWER_INDEX,
        MOCK_ANSWER_TIMESTAMP
      )
    ).rejects.toThrowError(QUESTION_ROUND_ERROR_CODES.QUESTION_ALREADY_ANSWERED);
  });

  it("fails when unable to update player's score", async () => {
    const question = createMockQuestion();
    question.expirationTimestamp = MOCK_ANSWER_TIMESTAMP;

    vi.spyOn(gameStatePublisherClient.json, 'get').mockImplementation(
      () =>
        new Promise(resolve =>
          resolve(
            new Object({
              [`$.questions[${MOCK_QUESTION_INDEX}]`]: [question],
              ['$.players']: [createMockPlayers()],
            })
          )
        ) as Promise<any>
    );
    mockMultiCommand.exec.mockReturnValue(null);

    await expect(() =>
      answerQuestionTransaction(
        MOCK_ROOM_ID,
        MOCK_USER_ID,
        MOCK_QUESTION_INDEX,
        MOCK_ANSWER_INDEX,
        MOCK_ANSWER_TIMESTAMP
      )
    ).rejects.toThrowError(REDIS_ERROR_CODES.TRANSACTION_ATTEMPT_LIMIT_REACHED);
  });

  it('should return the updated players', async () => {
    const question = createMockQuestion();
    question.expirationTimestamp = MOCK_ANSWER_TIMESTAMP + 1000;

    const expectedUpdatedPlayers = createMockPlayers();
    expectedUpdatedPlayers[0].answers = [MOCK_ANSWER_INDEX];
    expectedUpdatedPlayers[0].score += calculateScore(
      question.expirationTimestamp,
      MOCK_ANSWER_TIMESTAMP,
      question.answer,
      MOCK_ANSWER_INDEX
    );

    vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce({
      [`$.questions[${MOCK_QUESTION_INDEX}]`]: [question],
      ['$.players']: [createMockPlayers()],
    } as unknown as RedisJSON);
    mockMultiCommand.exec.mockReturnValueOnce(1);

    await expect(
      answerQuestionTransaction(
        MOCK_ROOM_ID,
        MOCK_USER_ID,
        MOCK_QUESTION_INDEX,
        MOCK_ANSWER_INDEX,
        MOCK_ANSWER_TIMESTAMP
      )
    ).resolves.toEqual(expectedUpdatedPlayers);
  });
});
