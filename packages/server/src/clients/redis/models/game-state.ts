export interface Question {
  question: string;
  choices: string[];
  answer: number; // Index in choices for correct answer.
}

export interface PlayerState {
  playerId: string;
  score: number;
  answers: boolean[]; // This could be more complex if we want to see what they said. Right now I just have it so we know if the question is right or wrong.
}

export interface GameState {
  roomId: string;
  players: PlayerState[];
  questions: Question[]; // We might not want to come up with all the questions right away so this array will grow as the game progresses.
}
