import { afterEach, describe, it } from 'node:test';
import { createMockGameState, redisClientMock } from 'src/testing/mocks/redis-client.mock';
import { createMockWebSocket } from 'src/testing/mocks/websocket.mock';
import { expect, vi } from 'vitest';
import { createRoomHandler } from '../create-room';
import { CREATE_ROOM_ERROR_RESPONSE, CREATE_ROOM_RESPONSE } from '../../types/response';
import type { CreateRoomReq } from '../create-room.validator';
import { CREATE_ROOM_ERROR_CODES } from '../create-room-errors';

describe('Create Room Handler', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return the happy path of the create room', async () => {
    const mockWebSocket = createMockWebSocket();
    const mockGameState = createMockGameState();
    redisClientMock.get.mockReturnValue(JSON.stringify(mockGameState));
    await createRoomHandler(mockWebSocket, { playerId: 'test' });
    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: CREATE_ROOM_RESPONSE,
        data: { ...mockGameState, host: 'test', players: [{ playerId: 'test', score: 0, answers: [] }] },
      })
    );
  });

  it('should return with an error of invalid schema', async () => {
    const mockWebSocket = createMockWebSocket();
    const invalidReq = { grape: 'yoeoo' } as unknown as CreateRoomReq;
    await createRoomHandler(mockWebSocket, invalidReq);
    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: CREATE_ROOM_ERROR_RESPONSE,
        data: { errorCode: CREATE_ROOM_ERROR_CODES.InvalidRoomReq },
      })
    );
  });

  it('should return if player already in a room', async () => {
    const mockWebSocket = createMockWebSocket();
    const mockGameState = createMockGameState();
    redisClientMock.get.mockReturnValue(JSON.stringify(mockGameState));
    await createRoomHandler(mockWebSocket, { playerId: 'test' });
    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: CREATE_ROOM_ERROR_RESPONSE,
        data: { errorCode: CREATE_ROOM_ERROR_CODES.PlayerAlreadyInRoom },
      })
    );
  });
});
