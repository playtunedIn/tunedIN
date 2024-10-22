import type { RedisQuery } from '../../../../clients/redis';
import {
  QUESTIONS_QUERY,
  QUESTION_INDEX_QUERY,
  ROOM_STATUS_QUERY,
  gameStatePublisherClient,
  queryMultiple,
} from '../../../../clients/redis';
import type { PlayerState, Question } from '../../../../clients/redis/models/game-state';
import { ROOM_STATUS } from '../../../../clients/redis/models/game-state';
import { REDIS_ERROR_CODES } from '../../../../errors';
import { endGameHandler } from '../../end-game/end-game';
import { questionRoundHandler } from './question-round';
import { UPDATE_ROUND_RESULTS } from '../../../responses';
import { publishMessageHandler } from '../../../subscribed-message-handlers';
import { cancelGameHandler } from '../../cancel-game/cancel-game';
import { getRoundLeaderboard } from '../../../../utils/room-helpers';

const LEADERBOARD_DISPLAY_TIMEOUT = 7000;

export const questionRoundResultsHandler = async (
  roomId: string,
  players: PlayerState[],
  questionIndex: number,
  question: Question
) => {
  const roundLeaderboard = getRoundLeaderboard(players, questionIndex);

  try {
    await gameStatePublisherClient.json.set(roomId, ROOM_STATUS_QUERY, ROOM_STATUS.SHOW_LEADERBOARD);
  } catch {
    return cancelGameHandler(roomId, REDIS_ERROR_CODES.COMMAND_FAILURE);
  }

  publishMessageHandler(roomId, UPDATE_ROUND_RESULTS, {
    roomStatus: ROOM_STATUS.SHOW_LEADERBOARD,
    results: roundLeaderboard,
    questionIndex,
    answers: question.answers,
  });

  setTimeout(() => questionRoundResultsTimeoutHandler(roomId), LEADERBOARD_DISPLAY_TIMEOUT);
};

const questionRoundResultsTimeoutHandler = async (roomId: string) => {
  let response: Record<RedisQuery, unknown>;
  try {
    response = await queryMultiple(roomId, [QUESTIONS_QUERY, QUESTION_INDEX_QUERY], gameStatePublisherClient);
  } catch (err) {
    return cancelGameHandler(roomId, (err as Error).message);
  }

  const questions = response[QUESTIONS_QUERY] as Question[];
  const questionIndex = response[QUESTION_INDEX_QUERY] as number;

  const allQuestionsAnswered = questionIndex === questions.length - 1;
  if (allQuestionsAnswered) {
    return endGameHandler(roomId);
  }

  try {
    await gameStatePublisherClient.json.set(roomId, QUESTION_INDEX_QUERY, questionIndex + 1);
  } catch {
    return cancelGameHandler(roomId, REDIS_ERROR_CODES.COMMAND_FAILURE);
  }

  questionRoundHandler(roomId);
};
