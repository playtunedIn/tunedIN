export interface PlayersState {
  players: PlayerState[];
  hostId: string;
  name: string;
}

export interface ReceivedPlayersState extends Omit<PlayersState, 'players' | 'name'> {
  players: ReceivedPlayerState[];
}

export interface PlayerState {
  name: string;
  score: number;
  answeredCurrentQuestion: boolean;
  /**
   * Player's answer to each question (null if they did not answer question)
   */
  answers: (number[] | null)[];
}

export type ReceivedPlayerState = Omit<PlayerState, 'answeredCurrentQuestion'>;

export interface RoundResults {
  results: PlayerRoundResult[];
  questionIndex: number;
}

export interface PlayerRoundResult {
  name: string;
  score: number;
  answers: number[] | null;
}
