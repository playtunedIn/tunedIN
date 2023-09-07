import { ROOM_ID_LENGTH } from './constants';

export function generateDefaultGameState(roomId: string) {
  return {
    roomId: roomId,
    host: '',
    players: [],
    questions: [],
  };
}

export function generateUniqueRoomId(): string {
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < ROOM_ID_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
}
