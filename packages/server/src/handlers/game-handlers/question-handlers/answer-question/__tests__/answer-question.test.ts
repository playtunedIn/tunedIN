import type { WebSocket } from 'ws';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AnswerQuestionReq } from 'src/handlers/game-handlers/question-handlers/answer-question/answer-question.validator';
import { gameStatePublisherClient } from '../../../../../clients/redis';
import { createMockPlayers, createMockPublisherPayload } from '../../../../../testing/mocks/redis-client.mock';
import { GLOBAL_MOCK_NAME, GLOBAL_MOCK_USER_ID } from '../../../../../testing/mocks/auth.mock';
import { QUESTION_ROUND_ERROR_CODES, REDIS_ERROR_CODES } from '../../../../../errors';
import { createMockWebSocket, createMockWebSocketMessage } from '../../../../../testing/mocks/websocket.mock';
import {
  ANSWER_QUESTION_ERROR_RESPONSE,
  ANSWER_QUESTION_RESPONSE,
  PLAYER_ANSWERED_QUESTION_RESPONSE,
} from '../../../../responses';
import * as questionRoundResultsHandler from '../../question-round/question-round-results';
import { answerQuestionHandler } from '../answer-question';
import * as answerQuestionTransaction from '../answer-question-transaction';

describe('Answer Question Handler', () => {
  const MOCK_ROOM_ID = 'test room id';
  const MOCK_QUESTION_INDEX = 0;

  let ws: WebSocket;
  let mockAnswerQuestionReq: AnswerQuestionReq;
  beforeEach(() => {
    ws = createMockWebSocket();
    mockAnswerQuestionReq = {
      roomId: MOCK_ROOM_ID,
      questionIndex: MOCK_QUESTION_INDEX,
      answerIndexes: [0],
    };

    vi.spyOn(questionRoundResultsHandler, 'questionRoundResultsHandler');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('returns invalid req when schema is invalid', async () => {
    await answerQuestionHandler(ws, {} as AnswerQuestionReq);

    expect(ws.send).toHaveBeenCalledWith(
      createMockWebSocketMessage(ANSWER_QUESTION_ERROR_RESPONSE, {
        errorCode: QUESTION_ROUND_ERROR_CODES.INVALID_REQ,
      })
    );
    expect(questionRoundResultsHandler.questionRoundResultsHandler).not.toHaveBeenCalled();
  });

  it('fails if answer question transaction fails', async () => {
    vi.spyOn(answerQuestionTransaction, 'answerQuestionTransaction').mockRejectedValueOnce(
      new Error(REDIS_ERROR_CODES.COMMAND_FAILURE)
    );

    await answerQuestionHandler(ws, mockAnswerQuestionReq);

    expect(ws.send).toHaveBeenCalledWith(
      createMockWebSocketMessage(ANSWER_QUESTION_ERROR_RESPONSE, { errorCode: REDIS_ERROR_CODES.COMMAND_FAILURE })
    );
    expect(questionRoundResultsHandler.questionRoundResultsHandler).not.toHaveBeenCalled();
  });

  it('does not end the round when not everyone has answered question', async () => {
    vi.spyOn(answerQuestionTransaction, 'answerQuestionTransaction').mockResolvedValueOnce(createMockPlayers());

    await answerQuestionHandler(ws, mockAnswerQuestionReq);

    expect(ws.send).toHaveBeenCalledWith(createMockWebSocketMessage(ANSWER_QUESTION_RESPONSE, {}));
    expect(gameStatePublisherClient.publish).toHaveBeenCalledWith(
      MOCK_ROOM_ID,
      createMockPublisherPayload(PLAYER_ANSWERED_QUESTION_RESPONSE, { name: GLOBAL_MOCK_NAME }, GLOBAL_MOCK_USER_ID)
    );
    expect(questionRoundResultsHandler.questionRoundResultsHandler).not.toHaveBeenCalled();
  });

  it('calls round result handler when everyone has answered question', async () => {
    const players = createMockPlayers();
    // set question to answered (not null)
    players[0].answers = [[0]];
    players[1].answers = [[0]];

    vi.spyOn(answerQuestionTransaction, 'answerQuestionTransaction').mockResolvedValueOnce(players);

    await answerQuestionHandler(ws, mockAnswerQuestionReq);

    expect(ws.send).toHaveBeenCalledWith(createMockWebSocketMessage(ANSWER_QUESTION_RESPONSE, {}));
    expect(gameStatePublisherClient.publish).toHaveBeenCalledWith(
      MOCK_ROOM_ID,
      createMockPublisherPayload(PLAYER_ANSWERED_QUESTION_RESPONSE, { name: GLOBAL_MOCK_NAME }, GLOBAL_MOCK_USER_ID)
    );
    expect(questionRoundResultsHandler.questionRoundResultsHandler).toHaveBeenCalledWith(
      MOCK_ROOM_ID,
      players,
      MOCK_QUESTION_INDEX
    );
  });
});
