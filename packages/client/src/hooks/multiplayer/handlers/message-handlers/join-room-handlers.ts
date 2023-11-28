import { useAppDispatch } from '@hooks/store/app-store';
import { setName, updatePlayersState } from '@store/multiplayer/players-slice/players-slice';
import type { ReceivedPlayerState } from '@store/multiplayer/players-slice/players-slice.types';
import { updateQuestionsState } from '@store/multiplayer/questions-slice/questions-slice';
import type { ReceivedQuestion } from '@store/multiplayer/questions-slice/questions-slice.types';
import { updateRoomErrorCode, updateRoomState } from '@store/multiplayer/room-slice/room-slice';
import type { RoomStatus } from '@store/multiplayer/room-slice/room-slice.types';

export interface JoinRoomResponse {
  roomId: string;
  hostId: string;
  roomStatus: RoomStatus;
  players: ReceivedPlayerState[];
  questionIndex: number;
  questions: ReceivedQuestion[];
}

export interface JoinRoomErrorResponse {
  errorCode: string;
}

export const useJoinRoomResponseHandlers = () => {
  const dispatch = useAppDispatch();

  const joinRoomResponseHandler = (data: JoinRoomResponse) => {
    const { roomId, hostId, roomStatus, players, questionIndex, questions } = data;

    dispatch(
      updateRoomState({
        roomId,
        roomStatus,
      })
    );
    dispatch(
      updatePlayersState({
        hostId,
        players,
      })
    );
    dispatch(
      updateQuestionsState({
        questions,
        questionIndex,
      })
    );
  };

  const joinRoomErrorResponseHandler = (data: JoinRoomErrorResponse) => {
    dispatch(setName(''));
    dispatch(updateRoomErrorCode(data.errorCode));
  };

  return {
    joinRoomResponseHandler,
    joinRoomErrorResponseHandler,
  };
};
