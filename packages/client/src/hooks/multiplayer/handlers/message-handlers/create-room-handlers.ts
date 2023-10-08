import { useAppDispatch } from '@hooks/store/app-store';
import { updatePlayersState } from '@store/multiplayer/players-slice/players-slice';
import type { PlayerState } from '@store/multiplayer/players-slice/players-slice.types';
import { updateQuestionsState } from '@store/multiplayer/questions-slice/questions-slice';
import type { ReceivedQuestion } from '@store/multiplayer/questions-slice/questions-slice.types';
import { updateRoomErrorCode, updateRoomState } from '@store/multiplayer/room-slice/room-slice';
import type { RoomStatus } from '@store/multiplayer/room-slice/room-slice.types';

export interface CreateRoomResponse {
  roomId: string;
  hostId: string;
  roomStatus: RoomStatus;
  players: PlayerState[];
  questionIndex: number;
  questions: ReceivedQuestion[];
}

interface CreateRoomErrorResponse {
  errorCode: string;
}

export const useCreateRoomResponseHandlers = () => {
  const dispatch = useAppDispatch();

  const createRoomResponseHandler = (data: CreateRoomResponse) => {
    dispatch(
      updateRoomState({
        roomId: data.roomId,
        roomStatus: data.roomStatus,
      })
    );

    dispatch(
      updatePlayersState({
        hostId: data.hostId,
        players: data.players,
      })
    );

    dispatch(
      updateQuestionsState({
        questions: data.questions,
        questionIndex: data.questionIndex,
      })
    );
  };

  const createRoomErrorResponseHandler = (data: CreateRoomErrorResponse) => {
    dispatch(updateRoomErrorCode(data.errorCode));
  };

  return {
    createRoomResponseHandler,
    createRoomErrorResponseHandler,
  };
};
