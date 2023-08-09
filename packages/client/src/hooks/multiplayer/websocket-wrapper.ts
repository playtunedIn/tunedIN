/**
 * A super thin wrapper around the native WebSocket class. This aids in mocking for testing
 */
export class WebSocketWrapper extends WebSocket {
  constructor(url: string | URL, protocols?: string | string[]) {
    super(url, protocols);
  }
}
