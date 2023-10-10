import { useAppDispatch } from '@hooks/store/app-store';
import { resetPlayersAnsweredQuestion } from '@store/multiplayer/players-slice/players-slice';
import { addQuestion } from '@store/multiplayer/questions-slice/questions-slice';
import type { ReceivedQuestion } from '@store/multiplayer/questions-slice/questions-slice.types';
import { updateRoomStatus } from '@store/multiplayer/room-slice/room-slice';
import type { RoomStatus } from '@store/multiplayer/room-slice/room-slice.types';

export interface UpdateQuestionResponse {
  roomStatus: RoomStatus;
  question: ReceivedQuestion;
  questionIndex: number;
}

export const useUpdateQuestionsHandlers = () => {
  const dispatch = useAppDispatch();

  const updateCurrentQuestionHandler = (data: UpdateQuestionResponse) => {
    const { roomStatus, question, questionIndex } = data;
    dispatch(addQuestion({ question, questionIndex }));
    dispatch(resetPlayersAnsweredQuestion());
    dispatch(updateRoomStatus(roomStatus));
  };

  return { updateCurrentQuestionHandler };
};
