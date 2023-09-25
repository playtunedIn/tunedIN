import type { RedisJSON } from '@redis/json/dist/commands';

import type { PlayerState } from '../../../../clients/redis/models/game-state';
import { ROOM_STATUS, type Question } from '../../../../clients/redis/models/game-state';
import {
  PLAYERS_QUERY,
  QUESTIONS_QUERY,
  QUESTION_INDEX_QUERY,
  createQuestionQuery,
  gameStatePublisherClient,
} from '../../../../clients/redis';
import { REDIS_ERROR_CODES } from '../../../../errors';
import { allPlayersAnswered } from '../../../../utils/room-helpers';
import { publishMessageHandler } from '../../../subscribed-message-handlers';
import { UPDATE_ROOM_STATUS_RESPONSE } from '../../../responses';
import { cancelGameHandler } from '../../cancel-game/cancel-game';
import { questionRoundResultsHandler } from './question-round-results';

export const QUESTION_ROUND_TIME_LIMIT = 20000;

export const questionRoundHandler = async (roomId: string) => {
  let response: Record<string, unknown[]>;
  try {
    response = (await gameStatePublisherClient.json.get(roomId, {
      path: [QUESTIONS_QUERY, QUESTION_INDEX_QUERY],
    })) as Record<string, unknown[]>;
  } catch {
    return cancelGameHandler(roomId, REDIS_ERROR_CODES.COMMAND_FAILURE);
  }

  if (response[QUESTIONS_QUERY]?.[0] === null || response[QUESTION_INDEX_QUERY]?.[0] === null) {
    return cancelGameHandler(roomId, REDIS_ERROR_CODES.KEY_NOT_FOUND);
  }

  const questions = response[QUESTIONS_QUERY][0] as Question[];
  const questionIndex = response[QUESTION_INDEX_QUERY][0] as number;
  const question = questions[questionIndex];
  const questionExpirationTimestamp = Date.now() + QUESTION_ROUND_TIME_LIMIT;

  question.expirationTimestamp = questionExpirationTimestamp;

  const questionQuery = createQuestionQuery(questionIndex);
  try {
    await gameStatePublisherClient.json.set(roomId, questionQuery, question as unknown as RedisJSON);
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
  let response: RedisJSON[];
  try {
    response = (await gameStatePublisherClient.json.get(roomId, {
      path: PLAYERS_QUERY,
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
