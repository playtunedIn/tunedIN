export const ROOM_STATUS = {
  LOBBY: 'LOBBY',
  LOADING_GAME: 'LOADING_GAME',
  IN_QUESTION: 'IN_QUESTION',
  SHOW_LEADERBOARD: 'SHOW_LEADERBOARD',
  SHOW_GAME_RESULTS: 'SHOW_GAME_RESULTS',
  CANCELED: 'CANCELED',
} as const;

export type RoomStatus = (typeof ROOM_STATUS)[keyof typeof ROOM_STATUS];

export interface Question {
  expirationTimestamp?: number;
  question: string;
  choices: string[];
  answers: number[]; // Indexes in choices for correct answer.
}

export interface PlayerState {
  userId: string;
  name: string;
  score: number;
  /**
   * Player's answer to each question (null if they did not answer question)
   */
  answers: (number[] | null)[];
}

export interface PlayerRoundResult {
  name: string;
  score: number;
  answer: number[] | null;
}

export interface GameState {
  roomId: string;
  hostId: string;
  roomStatus: RoomStatus;
  players: PlayerState[];
  questionIndex: number;
  questions: Question[];
}

export interface PlayerRoomSession {
  roomId: string;
}
