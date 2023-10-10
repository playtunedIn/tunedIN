import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { ROOM_STATUS } from '@store/multiplayer/room-slice/room-slice.constants';
import type { RoomState, RoomStatus } from '@store/multiplayer/room-slice/room-slice.types';

const initialState: RoomState = {
  roomId: '',
  roomStatus: ROOM_STATUS.NOT_IN_ROOM,
};

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    updateRoomId: (state, action: PayloadAction<string>) => {
      state.roomId = action.payload;
    },
    updateRoomErrorCode: (state, action: PayloadAction<string | undefined>) => {
      state.roomErrorCode = action.payload;
    },
    updateRoomStatus: (state, action: PayloadAction<RoomStatus>) => {
      state.roomStatus = action.payload;
    },
    updateRoomState: (_, action: PayloadAction<RoomState>) => {
      return action.payload;
    },
  },
});

export default roomSlice.reducer;
export const { updateRoomId, updateRoomErrorCode, updateRoomState, updateRoomStatus } = roomSlice.actions;
