import type { PlayerRoundResult } from 'src/clients/redis/models/game-state';
import type { PlayerState } from 'src/clients/redis/models/game-state';

const ROOM_ID_LENGTH = 4;

export const createNewPlayerState = (playerId: string): PlayerState => ({
  playerId,
  name: playerId,
  score: 0,
  answers: [],
});

export const calculateScore = (
  questionExpirationTimestamp: number,
  currentTimestamp: number,
  questionAnswerIndex: number,
  answerIndex: number
): number => {
  if (questionAnswerIndex !== answerIndex) {
    return 0;
  }

  // keep numbers whole and every 1 second before the expiration is 100 points
  return Math.floor((questionExpirationTimestamp - currentTimestamp) * 0.1);
};

export const getRoundLeaderboard = (players: PlayerState[], questionIndex: number): PlayerRoundResult[] =>
  players.map(player => ({ name: player.name, score: player.score, answer: player.answers[questionIndex] }));

export const allPlayersAnswered = (players: PlayerState[], questionIndex: number) =>
  !players.some(player => player.answers[questionIndex] === null);

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
