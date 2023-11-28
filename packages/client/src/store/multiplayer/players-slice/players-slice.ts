import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type {
  PlayerState,
  PlayersState,
  ReceivedPlayerState,
  ReceivedPlayersState,
  RoundResults,
} from '@store/multiplayer/players-slice/players-slice.types';

const initialState: PlayersState = {
  players: [],
  hostId: '',
  name: '',
};

const playersSlice = createSlice({
  name: 'players',
  initialState,
  reducers: {
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    addPlayer: (state, action: PayloadAction<ReceivedPlayerState>) => {
      state.players.push({
        ...action.payload,
        answeredCurrentQuestion: false,
      });
    },
    updateHostId: (state, action: PayloadAction<string>) => {
      state.hostId = action.payload;
    },
    updatePlayerAnsweredQuestion: (state, action: PayloadAction<string>) => {
      const playerIndex = state.players.findIndex(player => player.name === action.payload);

      state.players[playerIndex].answeredCurrentQuestion = true;
    },
    resetPlayersAnsweredQuestion: state => {
      state.players.forEach((_, index) => {
        state.players[index].answeredCurrentQuestion = false;
      });
    },
    answerQuestion: (state, action: PayloadAction<{ answerIndexes: number[]; questionIndex: number }>) => {
      const { answerIndexes, questionIndex } = action.payload;
      const playerIndex = state.players.findIndex(player => player.name === state.name);

      state.players[playerIndex].answers[questionIndex] = answerIndexes;
      state.players[playerIndex].answeredCurrentQuestion = true;
    },
    updatePlayersScore: (state, action: PayloadAction<RoundResults>) => {
      const { questionIndex, results } = action.payload;

      state.players.forEach((player, index) => {
        const playerResults = results.find(playerResult => playerResult.name === player.name);
        if (playerResults) {
          state.players[index].answers[questionIndex] = playerResults.answers;
          state.players[index].score = playerResults.score;
        }
      });
    },
    updatePlayersState: (state, action: PayloadAction<ReceivedPlayersState>) => {
      const { hostId, players: receivedPlayers } = action.payload;

      state.hostId = hostId;

      const players = receivedPlayers.map<PlayerState>(player => ({ ...player, answeredCurrentQuestion: false }));
      state.players = players;
    },
  },
});

export default playersSlice.reducer;
export const {
  setName,
  updateHostId,
  updatePlayersState,
  addPlayer,
  updatePlayerAnsweredQuestion,
  resetPlayersAnsweredQuestion,
  answerQuestion,
  updatePlayersScore,
} = playersSlice.actions;
