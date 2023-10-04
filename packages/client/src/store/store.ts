import type { PreloadedState } from '@reduxjs/toolkit';
import { combineReducers, configureStore } from '@reduxjs/toolkit';

import playersReducers from './multiplayer/players-slice/players-slice';
import questionsReducers from './multiplayer/questions-slice/questions-slice';
import roomReducers from './multiplayer/room-slice/room-slice';

export const rootReducer = combineReducers({
  players: playersReducers,
  questions: questionsReducers,
  room: roomReducers,
});

export const setupStore = (preloadedState?: PreloadedState<RootState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
  });

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
