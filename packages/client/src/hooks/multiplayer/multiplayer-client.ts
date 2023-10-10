import {
  ANSWER_QUESTION_MESSAGE,
  CREATE_ROOM_MESSAGE,
  JOIN_ROOM_MESSAGE,
  START_GAME_MESSAGE,
} from '@hooks/multiplayer/handlers/socket-handlers.constants';
import { useAppDispatch } from '@hooks/store/app-store';
import { useSocket } from './socket';
import { setName } from '@store/multiplayer/players-slice/players-slice';

/**
 * This can only be called from a component within the context of the MultiplayerProvider
 */
export const useMultiplayerClient = () => {
  const { closeConnection, sendMessage, status } = useSocket();
  const dispatch = useAppDispatch();

  const createRoom = () => {
    sendMessage(CREATE_ROOM_MESSAGE);
  };

  const joinRoom = (roomId: string, name: string) => {
    dispatch(setName(name));
    sendMessage(JOIN_ROOM_MESSAGE, { roomId, name });
  };

  const startGame = (roomId: string) => {
    sendMessage(START_GAME_MESSAGE, { roomId });
  };

  const answerQuestion = (roomId: string, answerIndexes: number[], questionIndex: number) => {
    sendMessage(ANSWER_QUESTION_MESSAGE, { roomId, answerIndexes, questionIndex });
  };

  const exitRoom = () => {
    // TODO: Implement in SPOT-49
    closeConnection();
  };

  return {
    connectionStatus: status,
    createRoom,
    joinRoom,
    startGame,
    answerQuestion,
    exitRoom,
  };
};
