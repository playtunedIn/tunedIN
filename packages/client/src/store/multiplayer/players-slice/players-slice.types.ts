export interface PlayersState {
  players: PlayerState[];
  hostId: string;
}

export interface PlayerState {
  name: string;
  score: number;
  /**
   * Player's answer to each question (null if they did not answer question)
   */
  answers: (number[] | null)[];
}
