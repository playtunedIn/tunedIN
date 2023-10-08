import { useAppDispatch } from '@hooks/store/app-store';
import type { RoomState } from '@store/multiplayer/room-slice/room-slice.types';
import { updateRoomState } from '@store/multiplayer/room-slice/room-slice';

interface RecoverRoomSessionResponse {
  state: RoomState;
}

interface recoverRoomSessionErrorResponse {
  errorCode: string;
}

export const useRecoverRoomSessionHandlers = (setNeedsRecovery: React.Dispatch<React.SetStateAction<boolean>>) => {
  const dispatch = useAppDispatch();

  const recoverRoomSessionResponseHandler = (data: RecoverRoomSessionResponse) => {
    dispatch(updateRoomState(data.state));
    setNeedsRecovery(false);
  };

  const recoverRoomSessionErrorResponseHandler = (data: recoverRoomSessionErrorResponse) => {
    console.error(data);
  };

  return {
    recoverRoomSessionResponseHandler,
    recoverRoomSessionErrorResponseHandler,
  };
};
