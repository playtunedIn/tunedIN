import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WebSocket } from 'ws';

import { createMockWebSocket, createMockWebSocketMessage } from '../../../../testing/mocks/websocket.mock';
import { REDIS_ERROR_CODES, START_GAME_ERROR_CODES } from '../../../../errors';
import { gameStatePublisherClient } from '../../../../clients/redis';
import { ROOM_STATUS } from '../../../../clients/redis/models/game-state';
import { GLOBAL_MOCK_USER_ID } from '../../../../testing/mocks/auth.mock';
import type { StartGameReq } from '../start-game.validator';
import { startGameHandler } from '../start-game';
import { START_GAME_ERROR_RESPONSE, START_GAME_RESPONSE } from '../../types/response';

describe('Start Game Handler', () => {
  let ws: WebSocket;
  let mockStartGameReq: StartGameReq;
  beforeEach(() => {
    ws = createMockWebSocket();

    mockStartGameReq = {
      roomId: 'test room id',
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('has an invalid data schema', async () => {
    await startGameHandler(ws, {} as StartGameReq);

    expect(ws.send).toHaveBeenCalledWith(
      createMockWebSocketMessage(START_GAME_ERROR_RESPONSE, { errorCode: START_GAME_ERROR_CODES.INVALID_ROOM_REQ })
    );
  });

  it('fails redis json get command', async () => {
    vi.spyOn(gameStatePublisherClient.json, 'get').mockRejectedValueOnce('');

    await startGameHandler(ws, mockStartGameReq);

    expect(ws.send).toHaveBeenCalledWith(
      createMockWebSocketMessage(START_GAME_ERROR_RESPONSE, { errorCode: REDIS_ERROR_CODES.COMMAND_FAILURE })
    );
  });

  it('cannot access game state keys', async () => {
    vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce({});

    await startGameHandler(ws, mockStartGameReq);

    expect(ws.send).toHaveBeenCalledWith(
      createMockWebSocketMessage(START_GAME_ERROR_RESPONSE, { errorCode: REDIS_ERROR_CODES.KEY_NOT_FOUND })
    );
  });

  it('should not allow non-host to start game', async () => {
    vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce({
      '$.hostId': ['Someone else is host'],
      '$.roomStatus': [ROOM_STATUS.LOBBY],
    });

    await startGameHandler(ws, mockStartGameReq);

    expect(ws.send).toHaveBeenCalledWith(
      createMockWebSocketMessage(START_GAME_ERROR_RESPONSE, { errorCode: START_GAME_ERROR_CODES.NOT_HOST })
    );
  });

  it('should not start games for rooms that are not in lobby', async () => {
    vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce({
      '$.hostId': [GLOBAL_MOCK_USER_ID],
      '$.roomStatus': [ROOM_STATUS.IN_QUESTION],
    });

    await startGameHandler(ws, mockStartGameReq);

    expect(ws.send).toHaveBeenCalledWith(
      createMockWebSocketMessage(START_GAME_ERROR_RESPONSE, { errorCode: START_GAME_ERROR_CODES.ROOM_NOT_IN_LOBBY })
    );
  });

  it('should send error response if game state update fails', async () => {
    vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce({
      '$.hostId': [GLOBAL_MOCK_USER_ID],
      '$.roomStatus': [ROOM_STATUS.LOBBY],
    });
    vi.spyOn(gameStatePublisherClient.json, 'set').mockRejectedValueOnce('');

    await startGameHandler(ws, mockStartGameReq);

    expect(ws.send).toHaveBeenCalledWith(
      createMockWebSocketMessage(START_GAME_ERROR_RESPONSE, { errorCode: REDIS_ERROR_CODES.COMMAND_FAILURE })
    );
  });

  it('should start game', async () => {
    vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce({
      '$.hostId': [GLOBAL_MOCK_USER_ID],
      '$.roomStatus': [ROOM_STATUS.LOBBY],
    });
    vi.spyOn(gameStatePublisherClient.json, 'set').mockResolvedValueOnce('OK');

    await startGameHandler(ws, mockStartGameReq);

    expect(ws.send).toHaveBeenCalledWith(
      createMockWebSocketMessage(START_GAME_RESPONSE, { roomStatus: ROOM_STATUS.LOADING_GAME })
    );
  });
});
