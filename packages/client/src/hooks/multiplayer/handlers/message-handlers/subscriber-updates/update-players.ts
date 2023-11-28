import { useAppDispatch } from '@hooks/store/app-store';
import {
  addPlayer,
  updatePlayerAnsweredQuestion,
  updatePlayersScore,
} from '@store/multiplayer/players-slice/players-slice';
import type { PlayerRoundResult, ReceivedPlayerState } from '@store/multiplayer/players-slice/players-slice.types';
import { updateQuestionAnswers } from '@store/multiplayer/questions-slice/questions-slice';
import { updateRoomStatus } from '@store/multiplayer/room-slice/room-slice';
import type { RoomStatus } from '@store/multiplayer/room-slice/room-slice.types';

export interface AddPlayerResponse {
  player: ReceivedPlayerState;
}

export interface RoundResultsResponse {
  roomStatus: RoomStatus;
  results: PlayerRoundResult[];
  questionIndex: number;
  answers: number[];
}

export interface PlayerAnsweredQuestionResponse {
  name: string;
}

export const useUpdatePlayersHandlers = () => {
  const dispatch = useAppDispatch();

  const addPlayerHandler = (data: AddPlayerResponse) => {
    dispatch(addPlayer(data.player));
  };

  const playerAnsweredQuestionHandler = (data: PlayerAnsweredQuestionResponse) => {
    dispatch(updatePlayerAnsweredQuestion(data.name));
  };

  const updateRoundResultsHandler = (data: RoundResultsResponse) => {
    const { results, questionIndex, roomStatus, answers } = data;

    dispatch(updateQuestionAnswers({ answers, questionIndex }));
    dispatch(updatePlayersScore({ results, questionIndex }));
    dispatch(updateRoomStatus(roomStatus));
  };

  return { addPlayerHandler, updateRoundResultsHandler, playerAnsweredQuestionHandler };
};
