import { APP_ENV__backendHost } from 'src/app-env';

export default class MultiplayerService {
  private socket: WebSocket;

  constructor() {
    this.socket = new WebSocket(`wss://${APP_ENV__backendHost}/`);
    this.initSocketListeners();
  }

  private initSocketListeners() {
    this.socket.addEventListener('message', () => {
      /**
       * TODO: Implement with event handling
       */
    });

    this.socket.addEventListener('error', () => {
      /**
       * TODO: Implement with event handling
       */
    });
  }

  protected sendMessage(data: Record<string, unknown>) {
    const dataStr = JSON.stringify(data);
    this.socket.send(dataStr);
  }

  protected closeConnection() {
    this.socket.close();
  }
}
