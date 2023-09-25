export const REDIS_HOSTNAME = process.env.REDIS_HOSTNAME || 'redis://local.playtunedin-test.com:6379';
export const REDIS_DB_MAP = {
  gameState: 0,
  playerState: 1,
} as const;
