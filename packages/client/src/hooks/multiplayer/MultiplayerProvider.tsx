import type { PropsWithChildren } from 'react';
import { createContext, useEffect, useState } from 'react';

import { createSocket, useSocketHandlers } from './handlers/socket-handlers';
import type { SocketReadyState } from './handlers/socket-handlers.constants';
import { SOCKET_READY_STATES } from './handlers/socket-handlers.constants';

const _socket = createSocket();

interface SocketContextValues {
  socket: WebSocket;
  status: SocketReadyState;
  setStatus: React.Dispatch<React.SetStateAction<SocketReadyState>>;
}

export const SocketContext = createContext<SocketContextValues>({
  socket: _socket,
  status: SOCKET_READY_STATES.CONNECTING,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setStatus: () => {},
});

/**
 * Creates a socket and shares that socket with any multiplayer client within its context
 */
const MultiplayerProvider = ({ children }: PropsWithChildren) => {
  const [socket, setSocket] = useState(_socket);

  // We don't have reactivity around socket.readyState so need to create our own
  const [status, setStatus] = useState<SocketReadyState>(SOCKET_READY_STATES.CONNECTING);
  const [pingTimeout, setPingTimeout] = useState<NodeJS.Timeout | undefined>(undefined);
  const [needsRecovery, setNeedsRecovery] = useState(false);

  const { onMessage, onOpen, onError, onClose, onPing } = useSocketHandlers(
    socket,
    setSocket,
    setStatus,
    pingTimeout,
    setPingTimeout,
    needsRecovery,
    setNeedsRecovery
  );

  useEffect(() => {
    socket.addEventListener('open', onOpen);
    socket.addEventListener('message', onMessage);
    socket.addEventListener('error', onError);
    socket.addEventListener('close', onClose);
    socket.addEventListener('ping', onPing);

    return () => {
      socket.removeEventListener('open', onOpen);
      socket.removeEventListener('message', onMessage);
      socket.removeEventListener('error', onError);
      socket.removeEventListener('close', onClose);
      socket.removeEventListener('ping', onPing);
    };
  }, [socket, setSocket, onOpen, onMessage, onError, onClose, onPing]);

  return <SocketContext.Provider value={{ socket, status, setStatus }}>{children}</SocketContext.Provider>;
};

export default MultiplayerProvider;
