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
  expirationTimestamp?: number; //Todo Implement timer feature
  question: string;
  description: string;
  descriptionExtra?: string | string[];
  choices: string[];
  answerType: string;
  answers: number[]; // Indexes in choices for correct answer.
}

export type SanitizedQuestion = Omit<Question, 'answers'>;

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
  answers: number[] | null;
}

export interface GameState {
  roomId: string;
  hostId: string;
  roomStatus: RoomStatus;
  players: PlayerState[];
  questionIndex: number;
  questions: Question[];
}

export interface SanitizedGameState extends Omit<GameState, 'questions'> {
  questions: SanitizedQuestion[];
}

export interface PlayerRoomSession {
  roomId: string;
}
