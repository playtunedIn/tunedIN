//Create room error codes are from 100 - 199
export const CREATE_ROOM_ERROR_CODES = {
  InvalidRoomReq: 'MULT-100',
  GenerateIdError: 'MULT-101',
  GameStateStringifyingError: 'MULT-102',
  HandlerError: 'MULT-103',
} as const;
