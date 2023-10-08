import { useAppDispatch } from '@hooks/store/app-store';
import { updateRoomErrorCode } from '@store/multiplayer/room-slice/room-slice';

export interface StartGameErrorResponse {
  errorCode: string;
}

export const useStartGameResponseHandlers = () => {
  const dispatch = useAppDispatch();

  const startGameErrorResponseHandler = (data: StartGameErrorResponse) => {
    dispatch(updateRoomErrorCode(data.errorCode));
  };

  return {
    startGameErrorResponseHandler,
  };
};
