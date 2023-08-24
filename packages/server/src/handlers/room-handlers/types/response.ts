export const RECOVER_ROOM_SESSION_RESPONSE = 'recoverRoomSessionResponse';
export const RECOVER_ROOM_SESSION_ERROR_RESPONSE = 'recoverRoomSessionErrorResponse';

export type MessageHandlerResponse = typeof RECOVER_ROOM_SESSION_RESPONSE | typeof RECOVER_ROOM_SESSION_ERROR_RESPONSE;
