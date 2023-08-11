export enum JoinRoomErrorCode {
  InvalidRoomReq = 'INVALID_ROOM_REQ',
  RoomNotFound = 'ROOM_NOT_FOUND',
  RoomFull = 'ROOM_FULL',
  PlayerAlreadyInRoom = 'PLAYER_ALREADY_IN_ROOM',
  GameStateParsingError = 'GAME_STATE_PARSING_ERROR',
  GameStateStringifyingError = 'GAME_STATE_STRINGIFYING_ERROR',
  GenerateErrorResponseError = 'GENERATE_ERROR_RESPONSE_ERROR',
  HandlerError = 'HANDLER_ERROR',
}
