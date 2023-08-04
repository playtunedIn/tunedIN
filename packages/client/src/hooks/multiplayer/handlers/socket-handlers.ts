import { APP_ENV__backendHost } from 'src/app-env';
import { useSocketMessageHandlers } from './socket-message-handlers';
import { WebSocketWrapper } from '../websocket-wrapper';
import { SOCKET_READY_STATES, SOCKET_RECONNECT_TIMEOUT, type SocketReadyState } from './socket-handlers.constants';

export const createSocket = () => new WebSocketWrapper(`wss://${APP_ENV__backendHost}/ws/multiplayer`);

export const useSocketHandlers = (
  setSocket: React.Dispatch<React.SetStateAction<WebSocket>>,
  setStatus: React.Dispatch<React.SetStateAction<SocketReadyState>>
) => {
  let hasSocketError = false;
  const { messageHandlers } = useSocketMessageHandlers();

  const onOpen = () => {
    setStatus(SOCKET_READY_STATES.OPEN);
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

  const onError = (event: Event) => {
    // TODO: Better logging logistics when the socket closes due to error
    console.error(event);
    hasSocketError = true;
  };

  const onClose = () => {
    // TODO: Better logistics when the socket closes gracefully by the server
    setStatus(SOCKET_READY_STATES.CLOSED);

    // Only attempt reconnecting if close event was caused by an error
    if (hasSocketError) {
      setTimeout(() => {
        hasSocketError = false;
        setStatus(SOCKET_READY_STATES.CONNECTING);
        setSocket(createSocket());
      }, SOCKET_RECONNECT_TIMEOUT);
    }
  };

  return {
    onOpen,
    onMessage,
    onError,
    onClose,
  };
};
