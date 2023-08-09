import { useContext } from 'react';

import { SocketContext } from './MultiplayerProvider';
import { SOCKET_READY_STATES } from './handlers/socket-handlers.constants';

export const useSocket = () => {
  const { socket, status, setStatus } = useContext(SocketContext);

  const sendMessage = (message: Record<string, unknown>) => {
    let messageStr: string;
    try {
      messageStr = JSON.stringify(message);
    } catch (error) {
      console.error('Failed to stringify object: ', error);
      return;
    }

    try {
      socket.send(messageStr);
    } catch (error) {
      console.error('Failed to send socket message: ', error);
    }
  };

  const closeConnection = () => {
    setStatus(SOCKET_READY_STATES.CLOSING);
    socket.close();
  };

  return {
    status,
    sendMessage,
    closeConnection,
  };
};
