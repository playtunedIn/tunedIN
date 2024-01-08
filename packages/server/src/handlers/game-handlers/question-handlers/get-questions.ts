import type { RedisJSON } from '@redis/json/dist/commands';
import type { WebSocket } from 'ws';

import type { PlayerState, Question } from '../../../clients/redis/models/game-state';
import { QUESTIONS_QUERY, ROOT_QUERY, gameStatePublisherClient, playerStatePublisherClient, query } from '../../../clients/redis';
import { QUESTION_GENERATOR_CODES, REDIS_ERROR_CODES, START_GAME_ERROR_CODES } from '../../../errors';
import { cancelGameHandler } from '../cancel-game/cancel-game';
import { questionRoundHandler } from './question-round/question-round';
import type { User } from 'src/questionGeneratingService/types/question-types';
import { getGameQuestions } from '../../../questionGeneratingService/question-generating-service';
import { type TokenState } from '../../../clients/redis/models/token-state';
import { sendResponse } from '../../../utils/websocket-response';
import { QUESTION_GENERATOR_ERROR_RESPONSE } from '../../../handlers/responses';
import { decrypt } from '../../../utils/crypto';

export const getQuestionsHandler = async (ws: WebSocket, roomId: string, players: PlayerState[]) => {
  let questions: Question[];
    try {
      const users: User[] = await getUsersFromPlayerState(ws, roomId, players);
      console.log({users});
      if (users.length <= 0) {
        return sendResponse(ws, QUESTION_GENERATOR_ERROR_RESPONSE, { errorCode: QUESTION_GENERATOR_CODES.GET_QUESTION_HANDLER_ERROR});
      }
      const spotifyQuestions = await getGameQuestions(users, 3);
      console.log({spotifyQuestions});
 
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
     const results = await query(roomId, QUESTIONS_QUERY, gameStatePublisherClient);
     console.log({results})
   } catch {
     return cancelGameHandler(roomId, REDIS_ERROR_CODES.COMMAND_FAILURE);
   }
 
   questionRoundHandler(roomId);

};

export const getUsersFromPlayerState = async (ws: WebSocket, roomId: string, players: PlayerState[]) => {
  const users: User[] = [];

  for(const player of players) {
    try {

      const tokenStateJson = await query(player.userId, ROOT_QUERY, playerStatePublisherClient);

      if(tokenStateJson) {

        const tokenState = tokenStateJson as unknown as TokenState;
        if (tokenState.roomId !== roomId){
          sendResponse(ws, QUESTION_GENERATOR_ERROR_RESPONSE, { errorCode: QUESTION_GENERATOR_CODES.PLAYER_NOT_IN_ROOM});
        }

        if (!tokenState.authToken) {
          sendResponse(ws, QUESTION_GENERATOR_ERROR_RESPONSE, { errorCode: QUESTION_GENERATOR_CODES.AUTH_TOKEN_NOT_FOUND});
        }

        const decryptedToken = decrypt(tokenState.authToken);

        const user: User = {
            name: tokenState.name,
            token: decryptedToken ? decryptedToken : 'no token'
        }

        users.push(user);
      }
    } catch {
      sendResponse(ws, QUESTION_GENERATOR_ERROR_RESPONSE, { errorCode: QUESTION_GENERATOR_CODES.GET_USERS_FROM_PLAYER_STATE_FAILED});
    }
  }
  return users;
}
