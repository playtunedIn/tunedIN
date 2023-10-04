import { CREATE_ROOM_MESSAGE } from '@hooks/multiplayer/handlers/socket-handlers.constants';
import { useSocket } from './socket';

/**
 * This can only be called from a component within the context of the MultiplayerProvider
 */
export const useMultiplayerClient = () => {
  const { closeConnection, sendMessage, status } = useSocket();

  const createRoom = () => {
    sendMessage({ type: CREATE_ROOM_MESSAGE });
  };

  const exitRoom = () => {
    // TODO: Implement in SPOT-49
    closeConnection();
  };

  return {
    connectionStatus: status,
    createRoom,
    exitRoom,
  };
};
