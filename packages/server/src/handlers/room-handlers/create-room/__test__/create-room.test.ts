import type { Mock } from 'vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMockGameState, redisClientMock } from 'src/testing/mocks/redis-client.mock';
import { createMockWebSocket } from '../../../../testing/mocks/websocket.mock';
import { CREATE_ROOM_ERROR_RESPONSE, CREATE_ROOM_RESPONSE } from 'src/handlers/room-handlers/types/response';
import * as createRoomModule from '../create-room';
import * as handlerUtils from '../../../../utils/handlerUtils';
import { CREATE_ROOM_ERROR_CODES } from '../create-room-errors';
import * as mockRedisClients from '../../../../clients/redis/index';
import type { CreateRoomReq } from '../create-room.validator';

vi.mock('../../../../utils/handlerUtils');
vi.mock('../../../../clients/redis/index');

describe('Create Room Handler', () => {
  const defaultGameState = {
    roomId: '1232',
    host: '',
    players: [],
    questions: [],
  };

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return the happy path of the create room', async () => {
    const mockWebSocket = createMockWebSocket();
    const mockGameState = createMockGameState();
    (handlerUtils.generateUniqueRoomId as Mock).mockReturnValue('1232');
    (handlerUtils.generateDefaultGameState as Mock).mockReturnValue(defaultGameState);
    await createRoomModule.createRoomHandler(mockWebSocket, { playerId: 'test1' });
    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: CREATE_ROOM_RESPONSE,
        data: { ...mockGameState, roomId: '1232' },
      })
    );
  });

  it('should return with invalid create room req', async () => {
    const mockWebSocket = createMockWebSocket();
    const invalidReq = { roomId: 'test', grape: 'yoeoo' } as unknown as CreateRoomReq;
    await createRoomModule.createRoomHandler(mockWebSocket, invalidReq);
    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: CREATE_ROOM_ERROR_RESPONSE,
        data: { errorCode: CREATE_ROOM_ERROR_CODES.InvalidRoomReq },
      })
    );
  });

  it('should return with a generate id error', async () => {
    const mockWebSocket = createMockWebSocket();

    (mockRedisClients.gameStatePublisherClient.get as Mock).mockReturnValue(defaultGameState);
    await createRoomModule.createRoomHandler(mockWebSocket, { playerId: 'test2' });
    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: CREATE_ROOM_ERROR_RESPONSE,
        data: { errorCode: CREATE_ROOM_ERROR_CODES.GenerateIdError },
      })
    );
  });

  it('should return with handler error', async () => {
    const mockWebSocket = createMockWebSocket();

    redisClientMock.get.mockReturnValue(defaultGameState);
    (handlerUtils.generateUniqueRoomId as Mock).mockReturnValue('1234');
    (handlerUtils.generateDefaultGameState as Mock).mockReturnValue(defaultGameState);
    (mockRedisClients.gameStatePublisherClient.set as Mock).mockRejectedValue('error');
    await createRoomModule.createRoomHandler(mockWebSocket, { playerId: 'test2' });
    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: CREATE_ROOM_ERROR_RESPONSE,
        data: { errorCode: CREATE_ROOM_ERROR_CODES.HandlerError },
      })
    );
  });
});
