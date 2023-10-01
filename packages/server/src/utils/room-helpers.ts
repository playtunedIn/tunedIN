import type { PlayerRoundResult } from 'src/clients/redis/models/game-state';
import type { PlayerState } from 'src/clients/redis/models/game-state';

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
