export const JOIN_ROOM_RESPONSE = 'joinRoomResponse';
export const JOIN_ROOM_ERROR_RESPONSE = 'joinRoomErrorResponse';

export type MessageHandlerResponse = typeof JOIN_ROOM_RESPONSE | typeof JOIN_ROOM_ERROR_RESPONSE;
