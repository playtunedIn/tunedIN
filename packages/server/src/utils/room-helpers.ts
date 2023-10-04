import type { PlayerRoundResult, Question } from 'src/clients/redis/models/game-state';
import type { PlayerState } from 'src/clients/redis/models/game-state';

const ROOM_ID_LENGTH = 4;

export const createNewPlayerState = (userId: string): PlayerState => ({
  userId,
  name: userId,
  score: 0,
  answers: [],
});

export const calculateScore = (
  questionExpirationTimestamp: number,
  currentTimestamp: number,
  questionAnswerIndexes: number[],
  answerIndexes: number[]
): number => {
  const questionAnswersSet = new Set(questionAnswerIndexes);

  let numOfCorrectAnswers = 0;
  answerIndexes.forEach(answerIndex => {
    if (questionAnswersSet.has(answerIndex)) {
      numOfCorrectAnswers++;
    }
  });

  // keep numbers whole and every 1 second before the expiration is 100 points
  return Math.floor(numOfCorrectAnswers * ((questionExpirationTimestamp - currentTimestamp) * 0.1));
};

export const areValidAnswers = (answerIndexes: number[], question: Question): boolean => {
  if (answerIndexes.length === 0 || answerIndexes.length > question.choices.length) {
    return false;
  }

  const answersOutOfBounds = answerIndexes.some(answerIndex => {
    return answerIndex >= question.choices.length;
  });
  if (answersOutOfBounds) {
    return false;
  }

  const usedAnswers = new Set(answerIndexes);
  if (usedAnswers.size !== answerIndexes.length) {
    return false;
  }

  return true;
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
