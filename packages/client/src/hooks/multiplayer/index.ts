/**
 * We do not need to expose all of the multiplayer client's internals to the components.
 * The the following keeps logic clean and decoupled.
 */
export { useMultiplayerClient } from './multiplayer-client';
export { default as MultiplayerProvider } from './MultiplayerProvider';
export { SOCKET_READY_STATES, type SocketReadyState } from './handlers/socket-handlers.constants';
