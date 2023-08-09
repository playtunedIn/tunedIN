import type { RootState } from '@store/store';

export const mockInitialStoreState: RootState = {
  players: {
    players: [],
  },
  questions: {
    questions: [],
  },
  room: {
    roomId: '',
  },
};
