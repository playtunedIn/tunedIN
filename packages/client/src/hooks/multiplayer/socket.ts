import { useContext } from 'react';
import { SocketContext } from './MultiplayerProvider';

export const useSocket = () => {
  const socket = useContext(SocketContext);

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

  return {
    sendMessage,
  };
};
