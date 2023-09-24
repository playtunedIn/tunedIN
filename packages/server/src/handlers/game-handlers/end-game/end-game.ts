import { gameStatePublisherClient } from '../../../clients/redis';
import { ROOM_STATUS } from '../../../clients/redis/models/game-state';
import { REDIS_ERROR_CODES } from '../../../errors';
import { UPDATE_ROOM_STATUS_RESPONSE } from '../../responses';
import { publishMessageHandler } from '../../subscribed-message-handlers';
import { cancelGameHandler } from '../cancel-game/cancel-game';

export const endGameHandler = async (roomId: string) => {
  try {
    await gameStatePublisherClient.json.set(roomId, '$.roomStatus', ROOM_STATUS.SHOW_GAME_RESULTS);
  } catch {
    return cancelGameHandler(roomId, REDIS_ERROR_CODES.COMMAND_FAILURE);
  }

  publishMessageHandler(roomId, UPDATE_ROOM_STATUS_RESPONSE, { roomStatus: ROOM_STATUS.SHOW_GAME_RESULTS });
};
