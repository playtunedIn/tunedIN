import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import { createMockWebSocket, createMockWebSocketMessage } from '../../../../testing/mocks/websocket.mock';
import type { WebSocket } from 'ws';
import { createRoomHandler } from '../create-room';
import { ROOT_QUERY, gameStatePublisherClient } from 'src/clients/redis';
import { CREATE_ROOM_ERROR_RESPONSE, CREATE_ROOM_RESPONSE } from 'src/handlers/responses';
import { CREATE_ROOM_ERROR_CODES, REDIS_ERROR_CODES } from 'src/errors';
import * as roomHelpers from '../../../../utils/room-helpers';
import { ROOM_STATUS, type GameState } from 'src/clients/redis/models/game-state';
import { GLOBAL_MOCK_NAME, GLOBAL_MOCK_USER_ID } from 'src/testing/mocks/auth.mock';

describe('Create Room Handler', () => {
  let ws: WebSocket;

  beforeEach(() => {
    ws = createMockWebSocket();
    vi.spyOn(roomHelpers, 'generateUniqueRoomId').mockReturnValueOnce('4JTY');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('has a redis command failure while looking up if the generated room id exists', async () => {
    vi.spyOn(gameStatePublisherClient, 'exists').mockRejectedValueOnce('');

    await createRoomHandler(ws);

    expect(gameStatePublisherClient.json.set).not.toHaveBeenCalled();
    expect(ws.send).toHaveBeenCalledWith(
      createMockWebSocketMessage(CREATE_ROOM_ERROR_RESPONSE, { errorCode: REDIS_ERROR_CODES.COMMAND_FAILURE })
    );
  });

  it('has a redis command failure while looking up if the generated room id exists', async () => {
    vi.spyOn(gameStatePublisherClient, 'exists').mockResolvedValueOnce(1);

    await createRoomHandler(ws);

    expect(gameStatePublisherClient.json.set).not.toHaveBeenCalled();
    expect(ws.send).toHaveBeenCalledWith(
      createMockWebSocketMessage(CREATE_ROOM_ERROR_RESPONSE, { errorCode: CREATE_ROOM_ERROR_CODES.GENERATE_ID_ERROR })
    );
  });

  it('should create room', async () => {
    const expectedDefaultGameState: GameState = {
      roomId: '4JTY',
      hostId: GLOBAL_MOCK_USER_ID,
      players: [
        {
          userId: GLOBAL_MOCK_USER_ID,
          name: GLOBAL_MOCK_NAME,
          score: 0,
          answers: [],
        },
      ],
      questions: [],
      roomStatus: ROOM_STATUS.LOBBY,
      questionIndex: 0,
    };

    vi.spyOn(gameStatePublisherClient, 'exists').mockResolvedValueOnce(0);
    vi.spyOn(gameStatePublisherClient.json, 'set').mockResolvedValueOnce('OK');

    await createRoomHandler(ws);

    expect(roomHelpers.generateUniqueRoomId).toHaveBeenCalled();
    expect(gameStatePublisherClient.exists).toHaveBeenCalledWith('4JTY');
    expect(gameStatePublisherClient.json.set).toHaveBeenCalledWith('4JTY', ROOT_QUERY, expectedDefaultGameState);
    expect(ws.send).toHaveBeenCalledWith(createMockWebSocketMessage(CREATE_ROOM_RESPONSE, expectedDefaultGameState));
  });
});
