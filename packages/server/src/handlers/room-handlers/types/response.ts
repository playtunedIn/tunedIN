export const CREATE_ROOM_RESPONSE = 'createRoomResponse';
export const CREATE_ROOM_ERROR_RESPONSE = 'createRoomErrorResponse';
export const JOIN_ROOM_RESPONSE = 'joinRoomResponse';
export const JOIN_ROOM_ERROR_RESPONSE = 'joinRoomErrorResponse';

export type MessageHandlerResponse =
  | typeof CREATE_ROOM_RESPONSE
  | typeof CREATE_ROOM_ERROR_RESPONSE
  | typeof JOIN_ROOM_RESPONSE
  | typeof JOIN_ROOM_ERROR_RESPONSE;
