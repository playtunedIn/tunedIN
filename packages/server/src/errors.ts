export const UNKNOWN_ERROR = 'MULT-000' as const;

// Redis error codes are reserved from 001-099
export const REDIS_ERROR_CODES = {
  COMMAND_FAILURE: 'MULT-001',
  TRANSACTION_ATTEMPT_LIMIT_REACHED: 'MULT-002',
  TRANSACTION_KEY_CHANGE: 'MULT-003',
  KEY_NOT_FOUND: 'MULT-004',
} as const;

// Join room error codes are reserved from 200 - 299
export const JOIN_ROOM_ERROR_CODES = {
  INVALID_ROOM_REQ: 'MULT-200',
  ROOM_NOT_FOUND: 'MULT-201',
  ROOM_FULL: 'MULT-202',
  PLAYER_ALREADY_IN_ROOM: 'MULT-203',
} as const;