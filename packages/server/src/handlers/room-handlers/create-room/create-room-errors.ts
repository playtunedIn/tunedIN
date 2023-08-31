//Create room error codes are from 100 - 199
export const CREATE_ROOM_ERROR_CODES = {
  InvalidRoomReq: 'MULT-100',
  GameStateStringifyingError: 'MULT-101',
  HandlerError: 'MULT-102',
  JoinRoomHandlerError: 'MULT-103',
  GenerateIdError: 'MULT-104',
  UserAlreadyInRoom: 'Mult-105',
  PlayerAlreadyInRoom: 'MULT-106',
  RoomAlreadyExists: 'MULT-107',
} as const;
