/**
 * TODO: These types are not accurate. Implement create room handlers in SPOT-46
 */
import { useAppDispatch } from '@hooks/store/app-store';
import { updateRoomId } from '@store/multiplayer/room-slice/room-slice';

interface CreateRoomResponse {
  roomId: string;
}

interface CreateRoomErrorResponse {
  errorCode: string;
}

export const useCreateRoomResponseHandlers = () => {
  const dispatch = useAppDispatch();

  const createRoomResponseHandler = (data: CreateRoomResponse) => {
    dispatch(updateRoomId(data.roomId));
  };

  const createRoomErrorResponseHandler = (data: CreateRoomErrorResponse) => {
    dispatch(updateRoomId(''));
    console.error(data);
  };

  return {
    createRoomResponseHandler,
    createRoomErrorResponseHandler,
  };
};
