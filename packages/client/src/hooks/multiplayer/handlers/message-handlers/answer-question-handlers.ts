import { useAppDispatch } from '@hooks/store/app-store';
import { answerQuestion } from '@store/multiplayer/players-slice/players-slice';
import { updateRoomErrorCode } from '@store/multiplayer/room-slice/room-slice';

export interface AnswerQuestionResponse {
  questionIndex: number;
  answerIndexes: number[];
}

export interface AnswerQuestionErrorResponse {
  errorCode: string;
}

export const useAnswerQuestionResponseHandlers = () => {
  const dispatch = useAppDispatch();

  const answerQuestionResponseHandler = (data: AnswerQuestionResponse) => {
    const { questionIndex, answerIndexes } = data;
    dispatch(answerQuestion({ questionIndex, answerIndexes }));
  };

  const answerQuestionErrorResponseHandler = (data: AnswerQuestionErrorResponse) => {
    dispatch(updateRoomErrorCode(data.errorCode));
  };

  return {
    answerQuestionResponseHandler,
    answerQuestionErrorResponseHandler,
  };
};
