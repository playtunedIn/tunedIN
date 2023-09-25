import { createClient } from 'redis';

import { REDIS_DB_MAP, REDIS_HOSTNAME } from './redis.constants';

export { executeTransaction } from './transactions';

export const gameStatePublisherClient = createClient({
  name: 'Redis-Game-State-Publisher',
  url: REDIS_HOSTNAME,
  database: REDIS_DB_MAP.gameState,
});
export const gameStateSubscriberClient = createClient({
  name: 'Redis-Game-State-Subscriber',
  url: REDIS_HOSTNAME,
  database: REDIS_DB_MAP.gameState,
});
export const playerStatePublisherClient = createClient({
  name: 'Redis-Player-State-Publisher',
  url: REDIS_HOSTNAME,
  database: REDIS_DB_MAP.playerState,
});
