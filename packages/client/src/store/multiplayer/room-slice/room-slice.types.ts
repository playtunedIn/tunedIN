import type { ROOM_STATUS } from '@store/multiplayer/room-slice/room-slice.constants';

export interface RoomState {
  roomId: string;
  roomStatus: RoomStatus;
  roomErrorCode?: string;
}

export type RoomStatus = (typeof ROOM_STATUS)[keyof typeof ROOM_STATUS];
