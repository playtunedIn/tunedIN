import { afterEach, describe, expect, it, vi } from 'vitest';

import { cancelGameHandler } from 'src/handlers/game-handlers/cancel-game/cancel-game';
import { REDIS_ERROR_CODES } from 'src/errors';
import { gameStatePublisherClient } from 'src/clients/redis';
import { createMockPublisherPayload } from 'src/testing/mocks/redis-client.mock';
import { UPDATE_ROOM_STATUS_RESPONSE } from 'src/handlers/responses';
import { ROOM_STATUS } from 'src/clients/redis/models/game-state';

describe('Cancel Game Handler', () => {
  const mockRoomId = 'test room id';

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should just console error', async () => {
    vi.spyOn(gameStatePublisherClient.json, 'set').mockRejectedValueOnce('');

    await cancelGameHandler(mockRoomId, REDIS_ERROR_CODES.COMMAND_FAILURE);

    expect(gameStatePublisherClient.publish).not.toHaveBeenCalled();
  });

  it('publishes that the game is cancelled', async () => {
    await cancelGameHandler(mockRoomId, REDIS_ERROR_CODES.COMMAND_FAILURE);

    expect(gameStatePublisherClient.publish).toHaveBeenCalledWith(
      mockRoomId,
      createMockPublisherPayload(UPDATE_ROOM_STATUS_RESPONSE, { roomStatus: ROOM_STATUS.CANCELED })
    );
  });
});
