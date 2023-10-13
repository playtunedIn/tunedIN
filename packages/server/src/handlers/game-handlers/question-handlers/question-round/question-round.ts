import type { RedisJSON } from '@redis/json/dist/commands';

import type { PlayerState } from '../../../../clients/redis/models/game-state';
import { ROOM_STATUS, type Question } from '../../../../clients/redis/models/game-state';
import type { RedisQuery } from '../../../../clients/redis';
import {
  PLAYERS_QUERY,
  QUESTIONS_QUERY,
  QUESTION_INDEX_QUERY,
  createQuestionQuery,
  gameStatePublisherClient,
  query,
  queryMultiple,
} from '../../../../clients/redis';
import { REDIS_ERROR_CODES } from '../../../../errors';
import { allPlayersAnswered, sanitizeQuestion } from '../../../../utils/room-helpers';
import { publishMessageHandler } from '../../../subscribed-message-handlers';
import { UPDATE_ROOM_STATUS_RESPONSE } from '../../../responses';
import { cancelGameHandler } from '../../cancel-game/cancel-game';
import { questionRoundResultsHandler } from './question-round-results';

export const QUESTION_ROUND_TIME_LIMIT = 20000;

export const questionRoundHandler = async (roomId: string) => {
  let response: Record<RedisQuery, unknown>;
  try {
    response = await queryMultiple(roomId, [QUESTIONS_QUERY, QUESTION_INDEX_QUERY], gameStatePublisherClient);
  } catch (err) {
    return cancelGameHandler(roomId, (err as Error).message);
  }

  const questions = response[QUESTIONS_QUERY] as Question[];
  const questionIndex = response[QUESTION_INDEX_QUERY] as number;
  const question = questions[questionIndex];
  const questionExpirationTimestamp = Date.now() + QUESTION_ROUND_TIME_LIMIT;

  question.expirationTimestamp = questionExpirationTimestamp;

  const questionQuery = createQuestionQuery(questionIndex);
  try {
    await gameStatePublisherClient.json.set(roomId, questionQuery, question as unknown as RedisJSON);
  } catch {
    return cancelGameHandler(roomId, REDIS_ERROR_CODES.COMMAND_FAILURE);
  }

  const sanitizedQuestion = sanitizeQuestion(question);
  publishMessageHandler(roomId, UPDATE_ROOM_STATUS_RESPONSE, {
    roomStatus: ROOM_STATUS.IN_QUESTION,
    question: sanitizedQuestion,
  });
  setTimeout(() => questionRoundTimeoutHandler(roomId, questionIndex), questionExpirationTimestamp - Date.now());
};

const questionRoundTimeoutHandler = async (roomId: string, questionIndex: number) => {
  let players: PlayerState[];
  try {
    players = await query<PlayerState[]>(roomId, PLAYERS_QUERY, gameStatePublisherClient);
  } catch (err) {
    return cancelGameHandler(roomId, (err as Error).message);
  }

  if (!allPlayersAnswered(players, questionIndex)) {
    questionRoundResultsHandler(roomId, players, questionIndex);
  }
};
