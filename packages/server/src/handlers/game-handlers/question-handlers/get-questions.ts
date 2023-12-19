import type { RedisJSON } from '@redis/json/dist/commands';

import type { Question } from '../../../clients/redis/models/game-state';
import { QUESTIONS_QUERY, gameStatePublisherClient } from '../../../clients/redis';
import { getQuestions } from '../../../clients/spotify/spotify-client';
import { REDIS_ERROR_CODES, START_GAME_ERROR_CODES } from '../../../errors';
import { cancelGameHandler } from '../cancel-game/cancel-game';
import { questionRoundHandler } from './question-round/question-round';
import type { User } from 'src/questionGeneratingService/types/question-types';
import { getGameQuestions } from '../../../questionGeneratingService/question-generating-service';

export const getQuestionsHandler = async (roomId: string, user: User) => {
  let questions: Question[];
  try {

     const spotifyQuestions = await getGameQuestions([user], 3);

      questions = spotifyQuestions.map(question => {
        return {
          question: question.questionTitle,
          description: question.questionDescription,
          descriptionExtra: question.questionDescriptionExtra,
          choices: question.answerOptions,
          answerType: question.answerType,
          answers: question.correctAnswer.map(answer => parseInt(answer))
        };
      })
  } catch {
    return cancelGameHandler(roomId, START_GAME_ERROR_CODES.GET_QUESTIONS_FAILED);
  }

  try {
    await gameStatePublisherClient.json.set(roomId, QUESTIONS_QUERY, questions as unknown as RedisJSON[]);
  } catch {
    return cancelGameHandler(roomId, REDIS_ERROR_CODES.COMMAND_FAILURE);
  }

  questionRoundHandler(roomId);
};
