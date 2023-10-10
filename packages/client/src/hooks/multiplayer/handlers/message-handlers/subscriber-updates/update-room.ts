import { useAppDispatch } from '@hooks/store/app-store';
import { updateRoomStatus } from '@store/multiplayer/room-slice/room-slice';
import type { RoomStatus } from '@store/multiplayer/room-slice/room-slice.types';

export interface UpdateRoomStatusResponse {
  roomStatus: RoomStatus;
}

export const useUpdateRoomHandlers = () => {
  const dispatch = useAppDispatch();

  const updateRoomStatusHandler = (data: UpdateRoomStatusResponse) => {
    dispatch(updateRoomStatus(data.roomStatus));
  };

  return { updateRoomStatusHandler };
};
