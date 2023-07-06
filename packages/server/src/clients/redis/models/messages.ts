const MESSAGE_TYPES = {
  CREATE_ROOM: 'CreateRoom',
  JOIN_ROOM: 'JoinRoom',
} as const;

export type MessageTypes = typeof MESSAGE_TYPES;
