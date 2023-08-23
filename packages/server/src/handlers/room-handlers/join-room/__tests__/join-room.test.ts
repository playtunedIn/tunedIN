import type { Mock } from 'vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as mockRedisClient from '../../../../clients/redis/redis-client';
import { joinRoomHandler } from 'src/handlers/room-handlers/join-room/join-room';
import { createMockGameState } from 'src/testing/mocks/redis-client.mock';
import { createMockWebSocket } from '../../../../testing/mocks/websocket.mock';
import { JOIN_ROOM_ERROR_RESPONSE, JOIN_ROOM_RESPONSE } from 'src/handlers/room-handlers/types/response';
import { JOIN_ROOM_ERROR_CODES } from '../join-room.errors';
import type { JoinRoomReq } from '../join-room.validator';

vi.mock('../../../../clients/redis/redis-client', () => ({
  publishChannel: vi.fn(),
  getValue: vi.fn(),
  setValue: vi.fn(),
}));

describe('Join Room Handler', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return the happy path of the join room', async () => {
    const mockGameState = createMockGameState();
    const mockWebSocket = createMockWebSocket();
    (mockRedisClient.getValue as Mock).mockReturnValue(JSON.stringify(mockGameState));
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
    (mockRedisClient.getValue as Mock).mockReturnValue(JSON.stringify(mockGameState));
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
    (mockRedisClient.getValue as Mock).mockReturnValue('');
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

    (mockRedisClient.getValue as Mock).mockReturnValue(JSON.stringify(mockGameState));
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

    (mockRedisClient.getValue as Mock).mockReturnValue(JSON.stringify(mockGameState));
    await joinRoomHandler(mockWebSocket, { roomId: 'test', playerId: 'newPlayerId' });

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: JOIN_ROOM_ERROR_RESPONSE,
        data: { errorCode: JOIN_ROOM_ERROR_CODES.PlayerAlreadyInRoom },
      })
    );
  });

  //todo
  // it('should return with a handler error', async () => {
  //   const mockGameState = createMockGameState();
  //   const mockWebSocket = createMockWebSocket();

  //   const mockReject = vi.fn().mockRejectedValue(new Error('Publish error'));

  //   const spy = vi.spyOn(mockRedisClient.publishChannel('', ''))

  //   const spy = vi.spyOn(mockRedisClient.publishChannel(mockGameState.roomId, JSON.stringify(mockWebSocket)).mockImplementation(async()=>{
  //     throw new Error('workload.json creating failed.')));

  //   (mockRedisClient.getValue as Mock).mockReturnValue(JSON.stringify(mockGameState));
  //   (mockRedisClient.publishChannel as Mock).mockImplementation; // Set the mockReject function here

  //   await joinRoomHandler(mockWebSocket, { roomId: 'test', playerId: 'test' });

  //   expect(mockRedisClient.publishChannel).toBeCalledTimes(1);

  //   expect(mockWebSocket.send).toHaveBeenCalledWith(
  //     JSON.stringify({
  //       type: JOIN_ROOM_RESPONSE,
  //       data: { ...mockGameState, host: 'test', players: [{ playerId: 'test', score: 0, answers: [] }] },
  //     })
  //   );
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
    (mockRedisClient.getValue as Mock).mockReturnValue(expectedGameState);
    await joinRoomHandler(mockWebSocket, data);
    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: JOIN_ROOM_ERROR_RESPONSE,
        data: { errorCode: JOIN_ROOM_ERROR_CODES.GameStateParsingError },
      })
    );
  });

  //todo
  // it('should expect that the game state has changed', async () => {
  //   const mockWebSocket = createMockWebSocket();
  //   const mockGameState = createMockGameState();
  //   const expectedGameState = { roomId: 'test', host: 'test', players: [{
  //     playerId: 'newPlayerId3',
  //     score: 0,
  //     answers: [],
  //   }], questions: [] };

  //   const data = { roomId: 'test', playerId: 'test' };

  //   mockGameState.roomId = 'test';
  //   (mockRedisClient.getValue as Mock).mockReturnValue(expectedGameState);
  //   await joinRoomHandler(mockWebSocket, data);
  //   expect(mockGameState).not.toEqual(expectedGameState);
  //   console.log(mockGameState);
  //   console.log(mockRedisClient.getValue(data.roomId));
  // });
});
