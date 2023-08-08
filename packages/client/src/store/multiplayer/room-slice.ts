import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface RoomState {
  roomId: string;
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
  },
});

export default roomSlice.reducer;
export const { updateRoomId } = roomSlice.actions;
