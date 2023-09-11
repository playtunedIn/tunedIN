export const JOIN_ROOM_RESPONSE = 'joinRoomResponse';
export const JOIN_ROOM_ERROR_RESPONSE = 'joinRoomErrorResponse';
export const RECOVER_ROOM_SESSION_RESPONSE = 'recoverRoomSessionResponse';
export const RECOVER_ROOM_SESSION_ERROR_RESPONSE = 'recoverRoomSessionErrorResponse';

export type MessageHandlerResponse =
  | typeof JOIN_ROOM_RESPONSE
  | typeof JOIN_ROOM_ERROR_RESPONSE
  | typeof RECOVER_ROOM_SESSION_RESPONSE
  | typeof RECOVER_ROOM_SESSION_ERROR_RESPONSE;
