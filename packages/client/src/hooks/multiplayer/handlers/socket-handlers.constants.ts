// Pulled from https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState
export const SOCKET_READY_STATES = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
} as const;

export type SocketReadyState =
  | typeof SOCKET_READY_STATES.CONNECTING
  | typeof SOCKET_READY_STATES.OPEN
  | typeof SOCKET_READY_STATES.CLOSING
  | typeof SOCKET_READY_STATES.CLOSED;

export const SOCKET_RECONNECT_TIMEOUT = 2000;
export const SOCKET_PING_TIMEOUT = 31000;
