import type { PlayerState } from 'src/clients/redis/models/game-state';

export const createNewPlayerState = (playerId: string): PlayerState => ({
  playerId,
  name: playerId,
  score: 0,
  answers: [],
});
