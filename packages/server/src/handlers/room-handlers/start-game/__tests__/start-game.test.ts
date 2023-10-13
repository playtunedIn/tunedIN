import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WebSocket } from 'ws';

import { createMockWebSocket, createMockWebSocketMessage } from '../../../../testing/mocks/websocket.mock';
import { REDIS_ERROR_CODES, START_GAME_ERROR_CODES } from '../../../../errors';
import { HOST_ID_QUERY, PLAYERS_QUERY, ROOM_STATUS_QUERY, gameStatePublisherClient } from '../../../../clients/redis';
import { ROOM_STATUS } from '../../../../clients/redis/models/game-state';
import { GLOBAL_MOCK_USER_ID } from '../../../../testing/mocks/auth.mock';
import * as getQuestions from '../../../game-handlers/question-handlers/get-questions';
import type { StartGameReq } from '../start-game.validator';
import { startGameHandler } from '../start-game';
import { START_GAME_ERROR_RESPONSE, UPDATE_ROOM_STATUS_RESPONSE } from '../../../responses';
import { createMockPlayers, createMockPublisherPayload } from 'src/testing/mocks/redis-client.mock';

describe('Start Game Handler', () => {
  const MOCK_ROOM_ID = 'TEST';

  let ws: WebSocket;
  let mockStartGameReq: StartGameReq;
  beforeEach(() => {
    ws = createMockWebSocket();

    mockStartGameReq = {
      roomId: MOCK_ROOM_ID,
    };

    vi.spyOn(getQuestions, 'getQuestionsHandler').mockResolvedValue();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('has an invalid data schema', async () => {
    await startGameHandler(ws, {} as StartGameReq);

    expect(gameStatePublisherClient.publish).not.toHaveBeenCalled();
    expect(ws.send).toHaveBeenCalledWith(
      createMockWebSocketMessage(START_GAME_ERROR_RESPONSE, { errorCode: START_GAME_ERROR_CODES.INVALID_ROOM_REQ })
    );
  });

  it('fails redis json get command', async () => {
    vi.spyOn(gameStatePublisherClient.json, 'get').mockRejectedValueOnce('');

    await startGameHandler(ws, mockStartGameReq);

    expect(gameStatePublisherClient.publish).not.toHaveBeenCalled();
    expect(ws.send).toHaveBeenCalledWith(
      createMockWebSocketMessage(START_GAME_ERROR_RESPONSE, { errorCode: REDIS_ERROR_CODES.COMMAND_FAILURE })
    );
  });

  it('should not allow non-host to start game', async () => {
    vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce({
      [HOST_ID_QUERY]: ['Someone else is host'],
      [ROOM_STATUS_QUERY]: [ROOM_STATUS.LOBBY],
      [PLAYERS_QUERY]: [createMockPlayers()],
    } as any);

    await startGameHandler(ws, mockStartGameReq);

    expect(gameStatePublisherClient.publish).not.toHaveBeenCalled();
    expect(ws.send).toHaveBeenCalledWith(
      createMockWebSocketMessage(START_GAME_ERROR_RESPONSE, { errorCode: START_GAME_ERROR_CODES.NOT_HOST })
    );
  });

  it('should not start games for rooms that are not in lobby', async () => {
    vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce({
      [HOST_ID_QUERY]: [GLOBAL_MOCK_USER_ID],
      [ROOM_STATUS_QUERY]: [ROOM_STATUS.IN_QUESTION],
      [PLAYERS_QUERY]: [createMockPlayers()],
    } as any);

    await startGameHandler(ws, mockStartGameReq);

    expect(gameStatePublisherClient.publish).not.toHaveBeenCalled();
    expect(ws.send).toHaveBeenCalledWith(
      createMockWebSocketMessage(START_GAME_ERROR_RESPONSE, { errorCode: START_GAME_ERROR_CODES.ROOM_NOT_IN_LOBBY })
    );
  });

  it('should not start when not enough players', async () => {
    vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce({
      [HOST_ID_QUERY]: [GLOBAL_MOCK_USER_ID],
      [ROOM_STATUS_QUERY]: [ROOM_STATUS.LOBBY],
      [PLAYERS_QUERY]: [[]],
    });

    await startGameHandler(ws, mockStartGameReq);

    expect(gameStatePublisherClient.publish).not.toHaveBeenCalled();
    expect(ws.send).toHaveBeenCalledWith(
      createMockWebSocketMessage(START_GAME_ERROR_RESPONSE, { errorCode: START_GAME_ERROR_CODES.NOT_ENOUGH_PLAYERS })
    );
  });

  it('should send error response if game state update fails', async () => {
    vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce({
      [HOST_ID_QUERY]: [GLOBAL_MOCK_USER_ID],
      [ROOM_STATUS_QUERY]: [ROOM_STATUS.LOBBY],
      [PLAYERS_QUERY]: [createMockPlayers()],
    } as any);
    vi.spyOn(gameStatePublisherClient.json, 'set').mockRejectedValueOnce('');

    await startGameHandler(ws, mockStartGameReq);

    expect(gameStatePublisherClient.publish).not.toHaveBeenCalled();
    expect(ws.send).toHaveBeenCalledWith(
      createMockWebSocketMessage(START_GAME_ERROR_RESPONSE, { errorCode: REDIS_ERROR_CODES.COMMAND_FAILURE })
    );
  });

  it('should start game', async () => {
    vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce({
      [HOST_ID_QUERY]: [GLOBAL_MOCK_USER_ID],
      [ROOM_STATUS_QUERY]: [ROOM_STATUS.LOBBY],
      [PLAYERS_QUERY]: [createMockPlayers()],
    } as any);
    vi.spyOn(gameStatePublisherClient.json, 'set').mockResolvedValueOnce('OK');

    await startGameHandler(ws, mockStartGameReq);

    expect(gameStatePublisherClient.publish).toHaveBeenCalledWith(
      MOCK_ROOM_ID,
      createMockPublisherPayload(UPDATE_ROOM_STATUS_RESPONSE, { roomStatus: ROOM_STATUS.LOADING_GAME })
    );
    expect(getQuestions.getQuestionsHandler).toHaveBeenCalledWith(MOCK_ROOM_ID);
  });
});
