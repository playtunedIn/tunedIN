import { REDIS_DB_MAP, RedisPublisherClient, RedisSubscriberClient } from './redis-client';

export const gameStatePublisherClient = new RedisPublisherClient(REDIS_DB_MAP.gameState, 'Redis-Game-State-Publisher');
export const gameStateSubscriberClient = new RedisSubscriberClient(
  REDIS_DB_MAP.gameState,
  'Redis-Game-State-Subscriber'
);
export const playerStatePublisherClient = new RedisPublisherClient(
  REDIS_DB_MAP.playerState,
  'Redis-Player-State-Publisher'
);
