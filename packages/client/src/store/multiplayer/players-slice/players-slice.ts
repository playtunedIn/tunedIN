import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { PlayerState, PlayersState } from '@store/multiplayer/players-slice/players-slice.types';

const initialState: PlayersState = {
  players: [],
  hostId: '',
};

const playersSlice = createSlice({
  name: 'players',
  initialState,
  reducers: {
    updatePlayers: (state, action: PayloadAction<PlayerState[]>) => {
      state.players = action.payload;
    },
    addPlayer: (state, action: PayloadAction<PlayerState>) => {
      state.players.push(action.payload);
    },
    updateHostId: (state, action: PayloadAction<string>) => {
      state.hostId = action.payload;
    },
    updatePlayersState: (_, action: PayloadAction<PlayersState>) => {
      return action.payload;
    },
  },
});

export default playersSlice.reducer;
export const { updatePlayers, updateHostId, updatePlayersState, addPlayer } = playersSlice.actions;
