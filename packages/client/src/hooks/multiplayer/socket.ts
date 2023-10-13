import { useContext } from 'react';

import { SocketContext } from './MultiplayerProvider';
import type { WebSocketMessageTypes } from './handlers/socket-handlers.constants';
import { SOCKET_READY_STATES } from './handlers/socket-handlers.constants';

export const useSocket = () => {
  const { socket, status, setStatus } = useContext(SocketContext);

  const sendMessage = (type: WebSocketMessageTypes, data?: Record<string, unknown>) => {
    const payload = {
      type,
      data,
    };

    let payloadStr: string;
    try {
      payloadStr = JSON.stringify(payload);
    } catch (error) {
      console.error('Failed to stringify object: ', error);
      return;
    }

    try {
      socket.send(payloadStr);
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
