/**
 * TODO: These types are not accurate. Implement exit room handler in SPOT-49
 */

import { useAppDispatch } from '@hooks/store/app-store';
import { updateRoomId } from '@store/multiplayer/room-slice/room-slice';

interface ExitRoomResponse {
  roomId: string;
}

interface ExitRoomErrorResponse {
  errorCode: string;
}

export const useExitRoomResponseHandlers = () => {
  const dispatch = useAppDispatch();

  const exitRoomResponseHandler = (data: ExitRoomResponse) => {
    dispatch(updateRoomId(data.roomId));
  };

  const exitRoomErrorResponseHandler = (data: ExitRoomErrorResponse) => {
    console.error(data);
  };

  return {
    exitRoomResponseHandler,
    exitRoomErrorResponseHandler,
  };
};
