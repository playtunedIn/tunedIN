import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { gameStatePublisherClient } from '../../../../clients/redis';
import { REDIS_ERROR_CODES } from '../../../../errors';
import * as cancelGameHandler from '../../cancel-game/cancel-game';
import { endGameHandler } from '../end-game';
import { createMockPublisherPayload } from 'src/testing/mocks/redis-client.mock';
import { UPDATE_ROOM_STATUS_RESPONSE } from 'src/handlers/responses';
import { ROOM_STATUS } from 'src/clients/redis/models/game-state';

describe('End Game Handler', () => {
  const mockRoomId = 'test room id';

  beforeEach(() => {
    vi.spyOn(cancelGameHandler, 'cancelGameHandler');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('cancels game if redis room update fails', async () => {
    vi.spyOn(gameStatePublisherClient.json, 'set').mockRejectedValueOnce('');

    await endGameHandler(mockRoomId);

    expect(cancelGameHandler.cancelGameHandler).toHaveBeenCalledWith(mockRoomId, REDIS_ERROR_CODES.COMMAND_FAILURE);
  });

  it('publishes end game room status', async () => {
    vi.spyOn(gameStatePublisherClient.json, 'set').mockResolvedValueOnce('OK');

    await endGameHandler(mockRoomId);

    expect(gameStatePublisherClient.publish).toHaveBeenCalledWith(
      mockRoomId,
      createMockPublisherPayload(UPDATE_ROOM_STATUS_RESPONSE, { roomStatus: ROOM_STATUS.SHOW_GAME_RESULTS })
    );
  });
});
