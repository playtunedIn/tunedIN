import type { WebSocket } from 'ws';

import type { PlayerState } from '../../../../clients/redis/models/game-state';
import { QUESTION_ROUND_ERROR_CODES } from '../../../../errors';
import { sendResponse } from '../../../../utils/websocket-response';
import { isValidSchema } from '../../../message.validator';
import { publishMessageHandler } from '../../../subscribed-message-handlers';
import {
  ANSWER_QUESTION_ERROR_RESPONSE,
  ANSWER_QUESTION_RESPONSE,
  PLAYER_ANSWERED_QUESTION_RESPONSE,
} from '../../../responses';
import { type AnswerQuestionReq, ANSWER_QUESTION_SCHEMA_NAME } from './answer-question.validator';
import { answerQuestionTransaction } from './answer-question-transaction';
import { questionRoundResultsHandler } from '../question-round/question-round-results';
import { allPlayersAnswered } from '../../../../utils/room-helpers';

export const answerQuestionHandler = async (ws: WebSocket, data: AnswerQuestionReq) => {
  if (!isValidSchema(data, ANSWER_QUESTION_SCHEMA_NAME)) {
    return sendResponse(ws, ANSWER_QUESTION_ERROR_RESPONSE, { errorCode: QUESTION_ROUND_ERROR_CODES.INVALID_REQ });
  }

  const { name, userId } = ws.userToken;
  const { roomId, questionIndex, answerIndex } = data;
  const answerTimeStamp = Date.now();

  let players: PlayerState[];
  try {
    players = await answerQuestionTransaction(roomId, userId, questionIndex, answerIndex, answerTimeStamp);
  } catch (err) {
    return sendResponse(ws, ANSWER_QUESTION_ERROR_RESPONSE, { errorCode: (err as Error).message });
  }

  sendResponse(ws, ANSWER_QUESTION_RESPONSE, {});
  await publishMessageHandler(roomId, PLAYER_ANSWERED_QUESTION_RESPONSE, { name }, userId);

  if (allPlayersAnswered(players, questionIndex)) {
    questionRoundResultsHandler(roomId, players, questionIndex);
  }
};
