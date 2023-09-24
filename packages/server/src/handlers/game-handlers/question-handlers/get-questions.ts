import type { RedisJSON } from '@redis/json/dist/commands';

import type { Question } from '../../../clients/redis/models/game-state';
import { gameStatePublisherClient } from '../../../clients/redis';
import { getQuestions } from '../../../clients/spotify/spotify-client';
import { REDIS_ERROR_CODES, START_GAME_ERROR_CODES } from '../../../errors';
import { cancelGameHandler } from '../cancel-game/cancel-game';
import { questionRoundHandler } from './question-round/question-round';

export const getQuestionsHandler = async (roomId: string) => {
  let questions: Question[];
  try {
    // TODO: Integrate with actual question fetching services
    questions = await getQuestions();
  } catch {
    return cancelGameHandler(roomId, START_GAME_ERROR_CODES.GET_QUESTIONS_FAILED);
  }

  const questionsQuery = '$.questions';
  try {
    await gameStatePublisherClient.json.set(roomId, questionsQuery, questions as unknown as RedisJSON[]);
  } catch {
    return cancelGameHandler(roomId, REDIS_ERROR_CODES.COMMAND_FAILURE);
  }

  questionRoundHandler(roomId);
};
