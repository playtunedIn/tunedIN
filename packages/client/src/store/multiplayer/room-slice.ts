import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface RoomState {
  roomId: string;
  roomErrorCode?: string;
}

const initialState: RoomState = {
  roomId: '',
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
    updateRoomState: (_, action: PayloadAction<RoomState>) => {
      return action.payload;
    },
  },
});

export default roomSlice.reducer;
export const { updateRoomId, updateRoomErrorCode, updateRoomState } = roomSlice.actions;
