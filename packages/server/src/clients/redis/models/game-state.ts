export const ROOM_STATUS = {
  LOBBY: 'LOBBY',
  LOADING_GAME: 'LOADING_GAME',
  IN_QUESTION: 'IN_QUESTION',
  IN_LEADERBOARD: 'IN_LEADERBOARD',
  RESULT: 'RESULTS',
} as const;

export type RoomStatus = (typeof ROOM_STATUS)[keyof typeof ROOM_STATUS];

export interface Question {
  question: string;
  choices: string[];
  answer: number; // Index in choices for correct answer.
}

export interface PlayerState {
  playerId: string;
  name: string;
  score: number;
  answers: boolean[]; // This could be more complex if we want to see what they said. Right now I just have it so we know if the question is right or wrong.
}

export interface GameState {
  roomId: string;
  hostId: string;
  roomStatus: RoomStatus;
  players: PlayerState[];
  questions: Question[];
}

export interface PlayerRoomSession {
  roomId: string;
}
