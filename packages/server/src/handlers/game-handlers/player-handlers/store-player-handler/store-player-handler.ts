import type { RedisJSON } from '@redis/json/dist/commands';

import type { TunedInJwtPayload } from 'src/utils/auth';
import { ROOT_QUERY, playerStatePublisherClient } from '../../../../clients/redis';
import { REDIS_ERROR_CODES } from '../../../../errors';

export const storePlayerDetailsHandler = async (user: TunedInJwtPayload) => {
  try {
    await playerStatePublisherClient.json.set(user.userId, ROOT_QUERY, user as unknown as RedisJSON);
  } catch {
    throw new Error(REDIS_ERROR_CODES.COMMAND_FAILURE);
  }
};
