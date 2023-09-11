import type { Mock } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WebSocket } from 'ws';

import {
  createMockGameState,
  createMockPlayerSessionState,
  redisClientMock as mockBaseRedisClient,
} from '../../../../testing/mocks/redis-client.mock';
import { createMockWebSocket } from '../../../../testing/mocks/websocket.mock';
import { recoverRoomSessionHandler } from '../../../room-handlers/recover-room-session/recover-room-session';
import { RECOVER_ROOM_SESSION_ERROR_CODES } from '../../../room-handlers/recover-room-session/recover-room-session.errors';
import {
  RECOVER_ROOM_SESSION_ERROR_RESPONSE,
  RECOVER_ROOM_SESSION_RESPONSE,
} from '../../../room-handlers/types/response';
import * as mockRedisClients from '../../../../clients/redis/index';

vi.mock('../../../../clients/redis/index');

describe('recoverRoomSessionHandler', () => {
  let mockWebSocket: WebSocket;
  beforeEach(() => {
    mockWebSocket = createMockWebSocket();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should fail cannot connect to redis player state', async () => {
    (mockRedisClients.playerStatePublisherClient.get as Mock).mockRejectedValueOnce('cannot connect to redis');

    await recoverRoomSessionHandler(mockWebSocket);

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: RECOVER_ROOM_SESSION_ERROR_RESPONSE,
        data: {
          errorCode: RECOVER_ROOM_SESSION_ERROR_CODES.PLAYER_SESSION_REQ_FAILED,
        },
      })
    );
  });

  it('should fail no player state', async () => {
    (mockRedisClients.playerStatePublisherClient.get as Mock).mockReturnValueOnce(null);

    await recoverRoomSessionHandler(mockWebSocket);

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: RECOVER_ROOM_SESSION_ERROR_RESPONSE,
        data: {
          errorCode: RECOVER_ROOM_SESSION_ERROR_CODES.PLAYER_SESSION_NOT_FOUND,
        },
      })
    );
  });

  it('should fail player state string unparsable', async () => {
    (mockRedisClients.playerStatePublisherClient.get as Mock).mockReturnValueOnce('not an object');

    await recoverRoomSessionHandler(mockWebSocket);

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: RECOVER_ROOM_SESSION_ERROR_RESPONSE,
        data: {
          errorCode: RECOVER_ROOM_SESSION_ERROR_CODES.CORRUPT_PLAYER_SESSION,
        },
      })
    );
  });

  it('should fail cannot connect to redis game state', async () => {
    const mockPlayerSession = createMockPlayerSessionState();
    (mockRedisClients.playerStatePublisherClient.get as Mock).mockReturnValueOnce(JSON.stringify(mockPlayerSession));
    (mockRedisClients.gameStatePublisherClient.get as Mock).mockRejectedValueOnce('could not connect');
    mockBaseRedisClient.get.mockReturnValueOnce('not an object');

    await recoverRoomSessionHandler(mockWebSocket);

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: RECOVER_ROOM_SESSION_ERROR_RESPONSE,
        data: {
          errorCode: RECOVER_ROOM_SESSION_ERROR_CODES.GAME_STATE_REQ_FAILED,
        },
      })
    );
  });

  it('should fail no game state', async () => {
    const mockPlayerSession = createMockPlayerSessionState();
    (mockRedisClients.playerStatePublisherClient.get as Mock).mockReturnValueOnce(JSON.stringify(mockPlayerSession));
    (mockRedisClients.gameStatePublisherClient.get as Mock).mockReturnValueOnce(null);

    await recoverRoomSessionHandler(mockWebSocket);

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: RECOVER_ROOM_SESSION_ERROR_RESPONSE,
        data: {
          errorCode: RECOVER_ROOM_SESSION_ERROR_CODES.GAME_STATE_NOT_FOUND,
        },
      })
    );
  });

  it('should fail game state string unparsable', async () => {
    const mockPlayerSession = createMockPlayerSessionState();
    (mockRedisClients.playerStatePublisherClient.get as Mock).mockReturnValueOnce(JSON.stringify(mockPlayerSession));
    (mockRedisClients.gameStatePublisherClient.get as Mock).mockReturnValueOnce('not an object');

    await recoverRoomSessionHandler(mockWebSocket);

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: RECOVER_ROOM_SESSION_ERROR_RESPONSE,
        data: {
          errorCode: RECOVER_ROOM_SESSION_ERROR_CODES.CORRUPT_GAME_STATE,
        },
      })
    );
  });

  it('should send game state', async () => {
    const mockGameState = createMockGameState();
    const mockPlayerSession = createMockPlayerSessionState();
    (mockRedisClients.playerStatePublisherClient.get as Mock).mockReturnValueOnce(JSON.stringify(mockPlayerSession));
    (mockRedisClients.gameStatePublisherClient.get as Mock).mockReturnValueOnce(JSON.stringify(mockGameState));

    await recoverRoomSessionHandler(mockWebSocket);

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: RECOVER_ROOM_SESSION_RESPONSE,
        data: {
          state: mockGameState,
        },
      })
    );
  });
});
