import type { Mock } from 'vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as mockRedisClient from '../../../../clients/redis/redis-client';
import { joinRoomHandler } from 'src/handlers/room-handlers/join-room/join-room';
import { createMockGameState } from 'src/testing/mocks/redis-client.mock';
import { createMockWebSocket } from '../../../../testing/mocks/websocket.mock';
import { JOIN_ROOM_RESPONSE } from 'src/handlers/room-handlers/types/response';

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

  /**
   * Test an invalid incoming schema
   */

  /**
   * Test failing to get game state
   */

  /**
   * Test failing to parse game state
   */

  /**
   * Test room full
   */

  /**
   * Test updating game state
   */
});
