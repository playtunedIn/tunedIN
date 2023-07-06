import { createRoomHandler } from '../create-room/create-room';
import { joinRoomHandler } from '../join-room/join-room';

export interface SocketMessage {
  type: keyof typeof messageHandlers;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export interface SocketResponse {
  type: keyof typeof messageHandlers;
}

export const messageHandlers = {
  CreateRoom: createRoomHandler,
  JoinRoom: joinRoomHandler,
};
