import type { RedisJSON } from '@redis/json/dist/commands';

import type { PlayerState } from '../../../../clients/redis/models/game-state';
import { ROOM_STATUS, type Question } from '../../../../clients/redis/models/game-state';
import { gameStatePublisherClient } from '../../../../clients/redis';
import { REDIS_ERROR_CODES } from '../../../../errors';
import { allPlayersAnswered } from '../../../../utils/room-helpers';
import { publishMessageHandler } from '../../../subscribed-message-handlers';
import { UPDATE_ROOM_STATUS_RESPONSE } from '../../../responses';
import { cancelGameHandler } from '../../cancel-game/cancel-game';
import { questionRoundResultsHandler } from './question-round-results';

export const QUESTION_ROUND_TIME_LIMIT = 20000;

export const questionRoundHandler = async (roomId: string) => {
  const questionsQuery = '$.questions';
  const questionIndexQuery = '$.questionIndex';

  let response: Record<string, unknown[]>;
  try {
    response = (await gameStatePublisherClient.json.get(roomId, {
      path: [questionsQuery, questionIndexQuery],
    })) as Record<string, unknown[]>;
  } catch {
    return cancelGameHandler(roomId, REDIS_ERROR_CODES.COMMAND_FAILURE);
  }

  if (response[questionsQuery]?.[0] === null || response[questionIndexQuery]?.[0] === null) {
    return cancelGameHandler(roomId, REDIS_ERROR_CODES.KEY_NOT_FOUND);
  }

  const questions = response[questionsQuery][0] as Question[];
  const questionIndex = response[questionIndexQuery][0] as number;
  const question = questions[questionIndex];
  const questionExpirationTimestamp = Date.now() + QUESTION_ROUND_TIME_LIMIT;

  question.expirationTimestamp = questionExpirationTimestamp;

  try {
    await gameStatePublisherClient.json.set(roomId, `$.questions[${questionIndex}]`, question as unknown as RedisJSON);
  } catch {
    return cancelGameHandler(roomId, REDIS_ERROR_CODES.COMMAND_FAILURE);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { answer, ...questionWithoutAnswer } = question;
  publishMessageHandler(roomId, UPDATE_ROOM_STATUS_RESPONSE, {
    roomStatus: ROOM_STATUS.IN_QUESTION,
    question: questionWithoutAnswer,
  });
  setTimeout(() => questionRoundTimeoutHandler(roomId, questionIndex), questionExpirationTimestamp - Date.now());
};

const questionRoundTimeoutHandler = async (roomId: string, questionIndex: number) => {
  const playersQuery = '$.players';

  let response: RedisJSON[];
  try {
    response = (await gameStatePublisherClient.json.get(roomId, {
      path: playersQuery,
    })) as RedisJSON[];
  } catch {
    return cancelGameHandler(roomId, REDIS_ERROR_CODES.COMMAND_FAILURE);
  }

  if (response[0] === null) {
    return cancelGameHandler(roomId, REDIS_ERROR_CODES.KEY_NOT_FOUND);
  }

  const players = response[0] as unknown as PlayerState[];

  if (!allPlayersAnswered(players, questionIndex)) {
    questionRoundResultsHandler(roomId, players, questionIndex);
  }
};
