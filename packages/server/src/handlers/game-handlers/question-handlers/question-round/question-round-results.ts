import {
  QUESTIONS_QUERY,
  QUESTION_INDEX_QUERY,
  ROOM_STATUS_QUERY,
  gameStatePublisherClient,
} from '../../../../clients/redis';
import type { PlayerState, Question } from '../../../../clients/redis/models/game-state';
import { ROOM_STATUS } from '../../../../clients/redis/models/game-state';
import { REDIS_ERROR_CODES } from '../../../../errors';
import { endGameHandler } from '../../end-game/end-game';
import { questionRoundHandler } from './question-round';
import { UPDATE_ROOM_STATUS_RESPONSE } from '../../../responses';
import { publishMessageHandler } from '../../../subscribed-message-handlers';
import { cancelGameHandler } from '../../cancel-game/cancel-game';
import { getRoundLeaderboard } from '../../../../utils/room-helpers';

const LEADERBOARD_DISPLAY_TIMEOUT = 7000;

export const questionRoundResultsHandler = async (roomId: string, players: PlayerState[], questionIndex: number) => {
  const roundLeaderboard = getRoundLeaderboard(players, questionIndex);

  try {
    await gameStatePublisherClient.json.set(roomId, ROOM_STATUS_QUERY, ROOM_STATUS.SHOW_LEADERBOARD);
  } catch {
    return cancelGameHandler(roomId, REDIS_ERROR_CODES.COMMAND_FAILURE);
  }

  publishMessageHandler(roomId, UPDATE_ROOM_STATUS_RESPONSE, {
    roomStatus: ROOM_STATUS.SHOW_LEADERBOARD,
    results: roundLeaderboard,
  });

  setTimeout(() => questionRoundResultsTimeoutHandler(roomId), LEADERBOARD_DISPLAY_TIMEOUT);
};

const questionRoundResultsTimeoutHandler = async (roomId: string) => {
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
