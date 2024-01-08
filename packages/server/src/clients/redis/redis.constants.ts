export const REDIS_HOSTNAME = process.env.REDIS_HOSTNAME || 'redis://localhost:6379';
export const REDIS_DB_MAP = {
  gameState: 0,
  playerState: 1,
} as const;

export const ROOT_QUERY = '$';

//GameState Queries
export const QUESTIONS_QUERY = '$.questions';
export const PLAYERS_QUERY = '$.players';
export const QUESTION_INDEX_QUERY = '$.questionIndex';
export const HOST_ID_QUERY = '$.hostId';
export const ROOM_STATUS_QUERY = '$.roomStatus';

//TokenState Queries
export const TOKEN_QUERY = '$.spotifyToken';
export const REFRESH_TOKEN_QUERY = '$.refresh';
export const USER_NAME_QUERY = '$.name';
export const TOKEN_EXPIRATION_QUERY = '$.exp';

export const createQuestionQuery = (questionIndex: number) => `$.questions[${questionIndex}]` as const;
export const createPlayerQuery = (playerIndex: number) => `$.players[${playerIndex}]` as const;

export type RedisQuery =
  | ReturnType<typeof createPlayerQuery>
  | ReturnType<typeof createQuestionQuery>
  | typeof ROOT_QUERY
  | typeof QUESTIONS_QUERY
  | typeof PLAYERS_QUERY
  | typeof QUESTION_INDEX_QUERY
  | typeof HOST_ID_QUERY
  | typeof ROOM_STATUS_QUERY;
