import { useSocket } from './socket';

/**
 * This can only be called from a component within the context of the MultiplayerProvider
 */
export const useMultiplayerClient = () => {
  const { closeConnection, sendMessage, status } = useSocket();

  const createRoom = () => {
    // TODO: Implement in SPOT-46
    sendMessage({ type: 'createRoom', data: { roomId: 'test' } });
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
