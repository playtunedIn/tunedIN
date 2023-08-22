//Join room error codes are from 200 - 299
export const JOIN_ROOM_ERROR_CODES = {
  InvalidRoomReq: 'MULT-200',
  RoomNotFound: 'MULT-201',
  RoomFull: 'MULT-202',
  PlayerAlreadyInRoom: 'MULT-203',
  GameStateParsingError: 'MULT-204',
  GameStateStringifyingError: 'MULT-205',
  GenerateErrorResponseError: 'MULT-206',
  HandlerError: 'MULT-207',
} as const;
