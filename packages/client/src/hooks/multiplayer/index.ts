/**
 * We do not need to expose all of the multiplayer client's internals to the components.
 * The MultiplayerProvider and the useMultiplayerClient keeps logic clean and decoupled.
 */
export { useMultiplayerClient } from './multiplayer-client';
export { default as MultiplayerProvider } from './MultiplayerProvider';
