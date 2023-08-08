import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

interface PlayersState {
  players: string[];
}

const initialState: PlayersState = {
  players: [],
};

const playersSlice = createSlice({
  name: 'players',
  initialState,
  reducers: {
    updatePlayers: (state, action: PayloadAction<string[]>) => {
      state.players = action.payload;
    },
  },
});

export default playersSlice.reducer;
export const { updatePlayers } = playersSlice.actions;
