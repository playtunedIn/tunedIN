import type { RedisJSON } from '@redis/json/dist/commands';

import type { PlayerState, Question } from '../../../../clients/redis/models/game-state';
import { executeTransaction, gameStatePublisherClient } from '../../../../clients/redis';
import { QUESTION_ROUND_ERROR_CODES, REDIS_ERROR_CODES } from '../../../../errors';
import { calculateScore } from '../../../../utils/room-helpers';

const ANSWER_QUESTION_TRANSACTION_ATTEMPTS = 10;

export const answerQuestionTransaction = async (
  roomId: string,
  userId: string,
  questionIndex: number,
  answerIndex: number,
  answerTimeStamp: number
) =>
  executeTransaction(ANSWER_QUESTION_TRANSACTION_ATTEMPTS, async () => {
    await gameStatePublisherClient.watch(roomId);

    const questionQuery = `$.questions[${questionIndex}]`;
    const playersQuery = '$.players';

    let response: Record<string, unknown[]>;
    try {
      response = (await gameStatePublisherClient.json.get(roomId, {
        path: [questionQuery, playersQuery],
      })) as Record<string, unknown[]>;
    } catch {
      throw new Error(REDIS_ERROR_CODES.COMMAND_FAILURE);
    }
    if (response[questionQuery]?.[0] === null || response[playersQuery]?.[0] === null) {
      throw new Error(REDIS_ERROR_CODES.KEY_NOT_FOUND);
    }

    const question = response[questionQuery][0] as Question;
    const players = response[playersQuery][0] as PlayerState[];

    if (answerIndex >= question.choices.length) {
      throw new Error(QUESTION_ROUND_ERROR_CODES.ANSWER_OUT_OF_RANGE);
    }

    if (!question.expirationTimestamp) {
      throw new Error(QUESTION_ROUND_ERROR_CODES.QUESTION_NOT_STARTED);
    }

    if (answerTimeStamp > question.expirationTimestamp) {
      throw new Error(QUESTION_ROUND_ERROR_CODES.QUESTION_EXPIRED);
    }

    const playerIndex = players.findIndex(player => player.playerId === userId);

    /**
     * player is passed by reference since the array players is an array of objects.
     * any update to player will also update the element in players
     */
    const player = players[playerIndex];
    if (!player) {
      throw new Error(QUESTION_ROUND_ERROR_CODES.PLAYER_NOT_FOUND);
    }

    if (player.answers[answerIndex] !== null) {
      throw new Error(QUESTION_ROUND_ERROR_CODES.QUESTION_ALREADY_ANSWERED);
    }

    const score = calculateScore(question.expirationTimestamp, answerTimeStamp, question.answer, answerIndex);

    player.answers[questionIndex] = answerIndex;
    player.score += score;

    const transaction = gameStatePublisherClient.multi();
    transaction.json.set(roomId, `$.players[${playerIndex}]`, player as unknown as RedisJSON);

    // TODO: Functionally Test this a lot we want to make sure it actually returns null
    const result = await transaction.exec();
    if (result === null) {
      throw new Error(REDIS_ERROR_CODES.TRANSACTION_KEY_CHANGE);
    }

    return players;
  });
