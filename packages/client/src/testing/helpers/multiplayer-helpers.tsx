import type { PropsWithChildren, ReactElement } from 'react';
import { Provider } from 'react-redux';
import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
import { configureStore, type PreloadedState } from '@reduxjs/toolkit';

import { MultiplayerProvider } from '@hooks/multiplayer';
import { rootReducer } from '@store/store';
import type { AppStore, RootState } from '@store/store';
import { mockInitialStoreState } from './multiplayer-helpers.constants';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: PreloadedState<RootState>;
  store?: AppStore;
}

const getMultiplayerProviders = ({
  preloadedState = mockInitialStoreState,
  store = configureStore({ reducer: rootReducer, preloadedState }),
}: ExtendedRenderOptions) => {
  const Wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>
      <MultiplayerProvider>{children}</MultiplayerProvider>
    </Provider>
  );

  return Wrapper;
};

export const renderMultiplayerProvider = (
  ui: ReactElement,
  { preloadedState, store, ...renderOptions }: ExtendedRenderOptions = {}
) => ({ store, ...render(ui, { wrapper: getMultiplayerProviders({ preloadedState, store }), ...renderOptions }) });

export const wrapMultiplayerProvider = ({ preloadedState, store }: ExtendedRenderOptions = {}) =>
  getMultiplayerProviders({ preloadedState, store });
