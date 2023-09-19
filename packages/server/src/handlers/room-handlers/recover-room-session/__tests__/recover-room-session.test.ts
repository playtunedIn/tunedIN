import type { WebSocket } from 'ws';
import type { Mock } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { gameStatePublisherClient, playerStatePublisherClient } from '../../../../clients/redis';
import { createMockWebSocket, createMockWebSocketMessage } from '../../../../testing/mocks/websocket.mock';
import { recoverRoomSessionHandler } from '../recover-room-session';
import { RECOVER_ROOM_SESSION_ERROR_RESPONSE, RECOVER_ROOM_SESSION_RESPONSE } from '../../types/response';
import { REDIS_ERROR_CODES } from '../../../../errors';
import { createMockGameState, createMockPlayerSessionState } from 'src/testing/mocks/redis-client.mock';

describe('Recover Room Session Handler', () => {
  let ws: WebSocket;
  beforeEach(() => {
    ws = createMockWebSocket();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('fails on redis command failures (player session)', async () => {
    vi.spyOn(playerStatePublisherClient.json, 'get').mockRejectedValueOnce('');

    await recoverRoomSessionHandler(ws);

    expect(ws.send).toHaveBeenCalledWith(
      createMockWebSocketMessage(RECOVER_ROOM_SESSION_ERROR_RESPONSE, { errorCode: REDIS_ERROR_CODES.COMMAND_FAILURE })
    );
  });

  it('fails when no player session is found', async () => {
    vi.spyOn(playerStatePublisherClient.json, 'get').mockResolvedValueOnce([null]);

    await recoverRoomSessionHandler(ws);

    expect(ws.send).toHaveBeenCalledWith(
      createMockWebSocketMessage(RECOVER_ROOM_SESSION_ERROR_RESPONSE, { errorCode: REDIS_ERROR_CODES.KEY_NOT_FOUND })
    );
  });

  it('fails on redis command failures (game state)', async () => {
    const mockPlayerSession = createMockPlayerSessionState();
    vi.spyOn(playerStatePublisherClient.json, 'get').mockResolvedValueOnce([mockPlayerSession as any]);
    vi.spyOn(gameStatePublisherClient.json, 'get').mockRejectedValueOnce('');

    await recoverRoomSessionHandler(ws);

    expect(ws.send).toHaveBeenCalledWith(
      createMockWebSocketMessage(RECOVER_ROOM_SESSION_ERROR_RESPONSE, { errorCode: REDIS_ERROR_CODES.COMMAND_FAILURE })
    );
  });

  it('fails when no game state is found', async () => {
    const mockPlayerSession = createMockPlayerSessionState();
    vi.spyOn(playerStatePublisherClient.json, 'get').mockResolvedValueOnce([mockPlayerSession as any]);
    vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce([null]);

    await recoverRoomSessionHandler(ws);

    expect(ws.send).toHaveBeenCalledWith(
      createMockWebSocketMessage(RECOVER_ROOM_SESSION_ERROR_RESPONSE, { errorCode: REDIS_ERROR_CODES.KEY_NOT_FOUND })
    );
  });

  it('should return state', async () => {
    const mockPlayerSession = createMockPlayerSessionState();
    const mockGameState = createMockGameState();
    vi.spyOn(playerStatePublisherClient.json, 'get').mockResolvedValueOnce([mockPlayerSession as any]);
    // all the redis clients share the same underlying functions. Had to mock higher up to get different return values
    (gameStatePublisherClient.json.get as Mock).mockResolvedValueOnce([mockGameState as any]);

    await recoverRoomSessionHandler(ws);

    expect(ws.send).toHaveBeenCalledWith(
      createMockWebSocketMessage(RECOVER_ROOM_SESSION_RESPONSE, { state: mockGameState })
    );
  });
});
