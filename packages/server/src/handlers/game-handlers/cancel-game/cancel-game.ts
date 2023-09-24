import { gameStatePublisherClient } from '../../../clients/redis';
import { ROOM_STATUS } from '../../../clients/redis/models/game-state';
import { publishMessageHandler } from '../../subscribed-message-handlers';
import { UPDATE_ROOM_STATUS_RESPONSE } from '../../responses';

/**
 * TODO: Refactor this to scan through websockets using this roomId and close them since redis may be down
 */
export const cancelGameHandler = async (roomId: string, errorCode: string) => {
  // TODO: replace error logging with tracking
  console.error({ errorCode, roomId });
  try {
    await gameStatePublisherClient.json.set(roomId, '$.roomStatus', ROOM_STATUS.CANCELED);
  } catch {
    console.error({ errorCode, roomId });
    return;
  }

  publishMessageHandler(roomId, UPDATE_ROOM_STATUS_RESPONSE, { roomStatus: ROOM_STATUS.CANCELED });
};
