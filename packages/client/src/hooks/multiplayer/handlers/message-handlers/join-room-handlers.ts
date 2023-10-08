import { useAppDispatch } from '@hooks/store/app-store';
import { updatePlayersState } from '@store/multiplayer/players-slice/players-slice';
import type { PlayerState } from '@store/multiplayer/players-slice/players-slice.types';
import { updateQuestionsState } from '@store/multiplayer/questions-slice/questions-slice';
import type { ReceivedQuestion } from '@store/multiplayer/questions-slice/questions-slice.types';
import { updateRoomErrorCode, updateRoomState } from '@store/multiplayer/room-slice/room-slice';
import type { RoomStatus } from '@store/multiplayer/room-slice/room-slice.types';

export interface JoinRoomResponse {
  roomId: string;
  hostId: string;
  roomStatus: RoomStatus;
  players: PlayerState[];
  questionIndex: number;
  questions: ReceivedQuestion[];
}

export interface JoinRoomErrorResponse {
  errorCode: string;
}

export const useJoinRoomResponseHandlers = () => {
  const dispatch = useAppDispatch();

  const joinRoomResponseHandler = (data: JoinRoomResponse) => {
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

  const joinRoomErrorResponseHandler = (data: JoinRoomErrorResponse) => {
    dispatch(updateRoomErrorCode(data.errorCode));
  };

  return {
    joinRoomResponseHandler,
    joinRoomErrorResponseHandler,
  };
};
