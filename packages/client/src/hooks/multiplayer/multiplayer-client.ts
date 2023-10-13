import {
  CREATE_ROOM_MESSAGE,
  JOIN_ROOM_MESSAGE,
  START_GAME_MESSAGE,
} from '@hooks/multiplayer/handlers/socket-handlers.constants';
import { useSocket } from './socket';

/**
 * This can only be called from a component within the context of the MultiplayerProvider
 */
export const useMultiplayerClient = () => {
  const { closeConnection, sendMessage, status } = useSocket();

  const createRoom = () => {
    sendMessage(CREATE_ROOM_MESSAGE);
  };

  const joinRoom = (roomId: string, name: string) => {
    sendMessage(JOIN_ROOM_MESSAGE, { roomId, name });
  };

  const startGame = (roomId: string) => {
    sendMessage(START_GAME_MESSAGE, { roomId });
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
    exitRoom,
  };
};
