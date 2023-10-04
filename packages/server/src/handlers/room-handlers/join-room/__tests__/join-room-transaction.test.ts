import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { gameStatePublisherClient } from '../../../../clients/redis';
import { joinRoomTransaction } from 'src/handlers/room-handlers/join-room/join-room-transaction';
import { JOIN_ROOM_ERROR_CODES, REDIS_ERROR_CODES } from 'src/errors';
import type { PlayerState } from 'src/clients/redis/models/game-state';
import { createMockPlayerState, mockMultiCommand } from 'src/testing/mocks/redis-client.mock';

describe('Join Room Transaction', () => {
  const mockPlayerStateArr: PlayerState[] = [
    {
      userId: 'userId',
      name: 'Joe Smith',
      score: 0,
      answers: [],
    },
  ];

  const mockRoomId = 'test roomId';
  let mockNewPlayer: PlayerState;
  beforeEach(() => {
    mockNewPlayer = createMockPlayerState();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('could not find players', async () => {
    vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce([null]);

    await expect(() => joinRoomTransaction(mockRoomId, mockNewPlayer)).rejects.toThrowError(
      REDIS_ERROR_CODES.KEY_NOT_FOUND
    );
  });

  it('found player in room already', async () => {
    vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce([mockPlayerStateArr as any]);

    mockNewPlayer.userId = 'userId';

    await expect(() => joinRoomTransaction(mockRoomId, mockNewPlayer)).rejects.toThrowError(
      JOIN_ROOM_ERROR_CODES.PLAYER_ALREADY_IN_ROOM
    );
  });

  it('should not let player join a full room', async () => {
    const mockFullPlayerStateArr: PlayerState[] = [
      {
        userId: 'userId',
        name: 'Joe Smith',
        score: 0,
        answers: [],
      },
      {
        userId: 'userId',
        name: 'Joe Smith',
        score: 0,
        answers: [],
      },
      {
        userId: 'userid',
        name: 'Joe Smith',
        score: 0,
        answers: [],
      },
      {
        userId: 'userId',
        name: 'Joe Smith',
        score: 0,
        answers: [],
      },
    ];
    vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce([mockFullPlayerStateArr as any]);

    await expect(() => joinRoomTransaction(mockRoomId, mockNewPlayer)).rejects.toThrowError(
      JOIN_ROOM_ERROR_CODES.ROOM_FULL
    );
  });

  it('should fail when redis multi fails too many times', async () => {
    /**
     * Grabbing an element by index is pass by reference so returning a new array each attempt
     * prevents the case where the player is found again by reusing the same array
     */
    vi.spyOn(gameStatePublisherClient.json, 'get').mockImplementation(
      () => new Promise(resolve => resolve(new Array([mockPlayerStateArr]))) as Promise<any>
    );
    mockMultiCommand.exec.mockReturnValue(null);

    await expect(() => joinRoomTransaction(mockRoomId, mockNewPlayer)).rejects.toThrowError(
      REDIS_ERROR_CODES.TRANSACTION_ATTEMPT_LIMIT_REACHED
    );
  });

  it('should return players', async () => {
    vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce([mockPlayerStateArr as any]);
    mockMultiCommand.exec.mockReturnValue(1);

    await expect(joinRoomTransaction(mockRoomId, mockNewPlayer)).resolves.toEqual([
      ...mockPlayerStateArr,
      mockNewPlayer,
    ]);
  });
});
