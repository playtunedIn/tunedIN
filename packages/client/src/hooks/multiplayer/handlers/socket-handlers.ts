import { APP_ENV__backendHost } from 'src/app-env';
import { useSocketMessageHandlers } from './socket-message-handlers';
import { WebSocketWrapper } from '../websocket-wrapper';
import {
  SOCKET_CLOSE_REASONS,
  SOCKET_PING_TIMEOUT,
  SOCKET_READY_STATES,
  SOCKET_RECONNECT_TIMEOUT,
  type SocketReadyState,
} from './socket-handlers.constants';

export const createSocket = () => new WebSocketWrapper(`wss://${APP_ENV__backendHost}/ws/multiplayer`);

export const useSocketHandlers = (
  socket: WebSocketWrapper,
  setSocket: React.Dispatch<React.SetStateAction<WebSocketWrapper>>,
  setStatus: React.Dispatch<React.SetStateAction<SocketReadyState>>,
  pingTimeout: NodeJS.Timeout | undefined,
  setPingTimeout: React.Dispatch<React.SetStateAction<NodeJS.Timeout | undefined>>,
  needsRecovery: boolean,
  setNeedsRecovery: React.Dispatch<React.SetStateAction<boolean>>
) => {
  let hasSocketError = false;
  const { messageHandlers } = useSocketMessageHandlers(setNeedsRecovery);

  const onOpen = () => {
    setStatus(SOCKET_READY_STATES.OPEN);

    if (needsRecovery) {
      socket.send(JSON.stringify({ type: 'recoverRoomSession' }));
    }
  };

  const onMessage = (message: MessageEvent) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: { type: keyof typeof messageHandlers; data: any };
    try {
      data = JSON.parse(message.data);
    } catch (err) {
      console.error('Could not parse socket message: ', err);
      return;
    }

    if (messageHandlers[data.type]) {
      messageHandlers[data.type](data.data);
    } else {
      console.error(`Unknown message type: ${data.type}`);
    }
  };

  const onPing = () => {
    clearTimeout(pingTimeout);

    setPingTimeout(
      setTimeout(() => {
        socket.close();
        setNeedsRecovery(true);
        reconnectSocket();
      }, SOCKET_PING_TIMEOUT)
    );
  };

  const onError = (event: Event) => {
    // TODO: Better logging logistics when the socket closes due to error
    console.error(event);
    hasSocketError = true;
  };

  const onClose = (event: CloseEvent) => {
    switch (event.code) {
      case SOCKET_CLOSE_REASONS.UNAUTHORIZED:
        // TODO: Update redux if unauthorized
        break;
    }

    setStatus(SOCKET_READY_STATES.CLOSED);

    // Only attempt reconnecting if close event was caused by an error
    if (hasSocketError) {
      setTimeout(() => {
        hasSocketError = false;
        reconnectSocket();
      }, SOCKET_RECONNECT_TIMEOUT);
    }
  };

  const reconnectSocket = () => {
    setStatus(SOCKET_READY_STATES.CONNECTING);
    setSocket(createSocket());
  };

  return {
    onOpen,
    onMessage,
    onPing,
    onError,
    onClose,
  };
};
