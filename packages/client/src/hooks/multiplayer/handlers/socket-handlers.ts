import { APP_ENV__backendHost } from 'src/app-env';
import { useSocketMessageHandlers } from './socket-message-handlers';
import { WebSocketWrapper } from '../websocket-wrapper';

const SOCKET_RECONNECT_TIMEOUT = 2000;

export const createSocket = () => new WebSocketWrapper(`wss://${APP_ENV__backendHost}/ws/multiplayer`);

export const useSocketHandlers = (setSocket: React.Dispatch<React.SetStateAction<WebSocket>>) => {
  const { messageHandlers } = useSocketMessageHandlers();

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
  };

  const onClose = () => {
    // TODO: Better logistics when the socket closes gracefully by the server
    setTimeout(() => {
      setSocket(createSocket());
    }, SOCKET_RECONNECT_TIMEOUT);
  };

  return {
    onMessage,
    onError,
    onClose,
  };
};
