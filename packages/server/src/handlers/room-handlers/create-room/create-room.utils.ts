import { gameStatePublisherClient } from '../../../clients/redis';
import type { CreateRoomReq } from './create-room.validator';

export function generateDefaultGameState(roomId: string) {
  return {
    roomId: roomId,
    hostId: '',
    players: [],
    questions: [],
  };
}

export function generateJoinRoomReq(
  defaultGameStateJson: { roomId: string; hostId: string; players: never[]; questions: never[] },
  data: CreateRoomReq
) {
  return {
    roomId: defaultGameStateJson.roomId,
    playerId: data.playerId,
  };
}

export async function generateUniqueRoomId(ROOM_ID_LENGTH: number): Promise<string> {
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let isUnique = false;

  while (!isUnique) {
    let result = '';

    for (let i = 0; i < ROOM_ID_LENGTH; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }

    const existingGameStateJson = await gameStatePublisherClient.get(result);

    if (!existingGameStateJson) {
      isUnique = true;
      return result;
    }
  }

  return '';
}
