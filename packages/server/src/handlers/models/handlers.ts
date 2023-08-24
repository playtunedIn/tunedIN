import { recoverRoomSessionHandler } from '../room-handlers/recover-room-session/recover-room-session';
import { createRoomHandler } from '../room-handlers/create-room/create-room';
import { joinRoomHandler } from '../room-handlers/join-room/join-room';
import { unsubscribeRoomHandler } from '../room-handlers/unsubscribe-room/unsubscribe-room';

export interface SocketMessage {
  type: keyof typeof messageHandlers;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export interface SocketResponse {
  type: keyof typeof messageHandlers;
}

export const messageHandlers = {
  createRoom: createRoomHandler,
  joinRoom: joinRoomHandler,
  unsubscribeRoom: unsubscribeRoomHandler,
  recoverRoomSession: recoverRoomSessionHandler,
};
