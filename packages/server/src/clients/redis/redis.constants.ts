export const REDIS_HOSTNAME = process.env.REDIS_HOSTNAME || 'redis://local.playtunedin-test.com:6379';
export const REDIS_DB_MAP = {
  gameState: 0,
  playerState: 1,
} as const;

export const ROOT_STATE_QUERY = '$';
export const QUESTIONS_QUERY = '$.questions';
export const PLAYERS_QUERY = '$.players';
export const QUESTION_INDEX_QUERY = '$.questionIndex';
export const HOST_ID_QUERY = '$.hostId';
export const ROOM_STATUS_QUERY = '$.roomStatus';

export const createQuestionQuery = (questionIndex: number) => `$.questions[${questionIndex}]`;
export const createPlayerQuery = (playerIndex: number) => `$.players[${playerIndex}]`;
