import { ReactElement, createContext, useEffect, useState } from 'react';
import { createSocket, useSocketHandlers } from './handlers/socket-handlers';

const _socket = createSocket();

interface MultiplayerProviderProps {
  children: ReactElement;
}

export const SocketContext = createContext(_socket);

/**
 * Creates a socket and shares that socket with any multiplayer client within its context
 */
const MultiplayerProvider = ({ children }: MultiplayerProviderProps) => {
  const [socket, setSocket] = useState(_socket);

  const { onMessage, onError, onClose } = useSocketHandlers(setSocket);

  useEffect(() => {
    socket.addEventListener('message', onMessage);
    socket.addEventListener('error', onError);
    socket.addEventListener('close', onClose);

    return () => {
      socket.removeEventListener('message', onMessage);
      socket.removeEventListener('error', onError);
      socket.removeEventListener('close', onClose);
    };
  }, [socket, setSocket, onMessage, onError, onClose]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export default MultiplayerProvider;
