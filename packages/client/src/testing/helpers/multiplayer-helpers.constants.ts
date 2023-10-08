import type { RootState } from '@store/store';
import { ROOM_STATUS } from '@store/multiplayer/room-slice/room-slice.constants';

export const mockInitialStoreState: RootState = {
  players: {
    players: [],
    hostId: '',
  },
  questions: {
    questions: [],
    questionIndex: 0,
  },
  room: {
    roomId: '',
    roomStatus: ROOM_STATUS.NOT_IN_ROOM,
  },
};
