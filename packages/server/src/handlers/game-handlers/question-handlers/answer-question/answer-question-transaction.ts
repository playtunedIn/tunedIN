import type { RedisJSON } from '@redis/json/dist/commands';

import type { PlayerState, Question } from '../../../../clients/redis/models/game-state';
import {
  PLAYERS_QUERY,
  createPlayerQuery,
  createQuestionQuery,
  executeTransaction,
  gameStatePublisherClient,
  queryMultiple,
} from '../../../../clients/redis';
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

    const questionQuery = createQuestionQuery(questionIndex);
    const response = await queryMultiple(
      roomId,
      [createQuestionQuery(questionIndex), PLAYERS_QUERY],
      gameStatePublisherClient
    );

    const question: Question = response[questionQuery] as Question;
    const players = response[PLAYERS_QUERY] as PlayerState[];

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

    const playerQuery = createPlayerQuery(playerIndex);
    const transaction = gameStatePublisherClient.multi();
    transaction.json.set(roomId, playerQuery, player as unknown as RedisJSON);

    // TODO: Functionally Test this a lot we want to make sure it actually returns null
    const result = await transaction.exec();
    if (result === null) {
      throw new Error(REDIS_ERROR_CODES.TRANSACTION_KEY_CHANGE);
    }

    return players;
  });