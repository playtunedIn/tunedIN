import { afterEach, describe, expect, it, vi } from 'vitest';

import { joinRoomHandler } from 'src/handlers/room-handlers/join-room/join-room';
import { createMockGameState, redisClientMock } from 'src/testing/mocks/redis-client.mock';
import { createMockWebSocket } from '../../../../testing/mocks/websocket.mock';
import { JOIN_ROOM_ERROR_RESPONSE, JOIN_ROOM_RESPONSE } from 'src/handlers/room-handlers/types/response';
import { JOIN_ROOM_ERROR_CODES } from '../join-room.errors';
import type { JoinRoomReq } from '../join-room.validator';

describe('Join Room Handler', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return the happy path of the join room', async () => {
    const mockGameState = createMockGameState();
    const mockWebSocket = createMockWebSocket();
    redisClientMock.get.mockReturnValue(JSON.stringify(mockGameState));
    await joinRoomHandler(mockWebSocket, { roomId: 'test', playerId: 'test' });
    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: JOIN_ROOM_RESPONSE,
        data: { ...mockGameState, host: 'test', players: [{ playerId: 'test', score: 0, answers: [] }] },
      })
    );
  });

  it('should return with an error of invalid schema', async () => {
    const mockGameState = createMockGameState();
    const mockWebSocket = createMockWebSocket();
    const invalidReq = { roomId: 'test', grape: 'yoeoo' } as unknown as JoinRoomReq;
    redisClientMock.get.mockReturnValue(JSON.stringify(mockGameState));
    await joinRoomHandler(mockWebSocket, invalidReq);
    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: JOIN_ROOM_ERROR_RESPONSE,
        data: { errorCode: JOIN_ROOM_ERROR_CODES.InvalidRoomReq },
      })
    );
  });

  it('should return with an error of room not found', async () => {
    const mockWebSocket = createMockWebSocket();
    redisClientMock.get.mockReturnValue('');
    await joinRoomHandler(mockWebSocket, { roomId: 'test', playerId: 'test' });
    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: JOIN_ROOM_ERROR_RESPONSE,
        data: { errorCode: JOIN_ROOM_ERROR_CODES.RoomNotFound },
      })
    );
  });

  it('should return room is full', async () => {
    const mockGameState = createMockGameState();
    const mockWebSocket = createMockWebSocket();

    const newPlayer = {
      playerId: 'newPlayerId',
      score: 0,
      answers: [],
    };

    const newPlayer2 = {
      playerId: 'newPlayerId2',
      score: 0,
      answers: [],
    };

    const newPlayer3 = {
      playerId: 'newPlayerId3',
      score: 0,
      answers: [],
    };

    const newPlayer4 = {
      playerId: 'newPlayerId4',
      score: 0,
      answers: [],
    };

    mockGameState.players.push(newPlayer);
    mockGameState.players.push(newPlayer2);
    mockGameState.players.push(newPlayer3);
    mockGameState.players.push(newPlayer4);

    redisClientMock.get.mockReturnValue(JSON.stringify(mockGameState));
    await joinRoomHandler(mockWebSocket, { roomId: 'test', playerId: 'test' });
    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: JOIN_ROOM_ERROR_RESPONSE,
        data: { errorCode: JOIN_ROOM_ERROR_CODES.RoomFull },
      })
    );
  });

  it('should return with an error if player is already in the room', async () => {
    const mockGameState = createMockGameState();
    const newPlayer = {
      playerId: 'newPlayerId',
      score: 0,
      answers: [],
    };
    mockGameState.players.push(newPlayer); // Assume `newPlayer` has already joined the room
    const mockWebSocket = createMockWebSocket();

    redisClientMock.get.mockReturnValue(JSON.stringify(mockGameState));
    await joinRoomHandler(mockWebSocket, { roomId: 'test', playerId: 'newPlayerId' });

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: JOIN_ROOM_ERROR_RESPONSE,
        data: { errorCode: JOIN_ROOM_ERROR_CODES.PlayerAlreadyInRoom },
      })
    );
  });

  //TODO
  // it('should return with a handler error', async () => {
  // });

  it('should expect that there is a parsing error', async () => {
    const mockWebSocket = createMockWebSocket();
    const mockGameState = createMockGameState();
    const expectedGameState = `{ roomId: 'test', host: 'test', players: [{
      playerId: 'newPlayerId3',
      score: 0,
      answers: [],
    }], questions: [] }`;

    const data = { roomId: 'test', playerId: 'test' };

    mockGameState.roomId = 'test';
    redisClientMock.get.mockReturnValue(expectedGameState);
    await joinRoomHandler(mockWebSocket, data);
    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: JOIN_ROOM_ERROR_RESPONSE,
        data: { errorCode: JOIN_ROOM_ERROR_CODES.GameStateParsingError },
      })
    );
  });

  //TODO
  // it('should expect that the game state has changed', async () => {
  // });
});