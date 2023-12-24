import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { gameStatePublisherClient } from '../../../../clients/redis';
import { GLOBAL_MOCK_USER_ID } from '../../../../testing/mocks/auth.mock';
import { joinRoomTransaction } from 'src/handlers/room-handlers/join-room/join-room-transaction';
import { JOIN_ROOM_ERROR_CODES, REDIS_ERROR_CODES } from 'src/errors';
import type { GameState, PlayerState } from 'src/clients/redis/models/game-state';
import {
  createMockGameState,
  createMockPlayerState,
  createMockPlayers,
  mockMultiCommand,
} from 'src/testing/mocks/redis-client.mock';

describe('Join Room Transaction', () => {
  let mockRoomState: GameState;

  const mockRoomId = 'TEST';

  let mockNewPlayer: PlayerState;
  beforeEach(() => {
    mockRoomState = createMockGameState();
    mockRoomState.players = createMockPlayers();

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
    vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce([mockRoomState as any]);

    mockNewPlayer.userId = GLOBAL_MOCK_USER_ID;

    await expect(() => joinRoomTransaction(mockRoomId, mockNewPlayer)).rejects.toThrowError(
      JOIN_ROOM_ERROR_CODES.PLAYER_ALREADY_IN_ROOM
    );
  });

  it('errors when player name already taken', async () => {
    vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce([mockRoomState as any]);

    mockNewPlayer.name = 'Emil';

    await expect(() => joinRoomTransaction(mockRoomId, mockNewPlayer)).rejects.toThrowError(
      JOIN_ROOM_ERROR_CODES.NAME_TAKEN
    );
  });

  it('should not let player join a full room', async () => {
    mockRoomState.players = [
      {
        userId: '123',
        name: 'Joey',
        score: 0,
        answers: [],
      },
      {
        userId: '456',
        name: 'Smith',
        score: 0,
        answers: [],
      },
      {
        userId: '789',
        name: 'Joe',
        score: 0,
        answers: [],
      },
      {
        userId: '101',
        name: 'Jane',
        score: 0,
        answers: [],
      },
    ];
    vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce([mockRoomState as any]);

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
      () => new Promise(resolve => resolve([structuredClone(mockRoomState)])) as Promise<any>
    );
    mockMultiCommand.exec.mockReturnValue(null);

    await expect(() => joinRoomTransaction(mockRoomId, mockNewPlayer)).rejects.toThrowError(
      REDIS_ERROR_CODES.TRANSACTION_ATTEMPT_LIMIT_REACHED
    );
  });

  it('should return players', async () => {
    vi.spyOn(gameStatePublisherClient.json, 'get').mockResolvedValueOnce([mockRoomState as any]);
    mockMultiCommand.exec.mockReturnValue(1);

    await expect(joinRoomTransaction(mockRoomId, mockNewPlayer)).resolves.toEqual({
      ...mockRoomState,
      hostId: mockNewPlayer.userId,
      players: [...mockRoomState.players, mockNewPlayer],
    });
  });
});
