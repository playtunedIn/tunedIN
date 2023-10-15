import { describe, it, expect } from 'vitest';

import { renderMultiplayerProvider } from '@testing/helpers/multiplayer-helpers';
import App from './App';

describe('Sanity Test Suite', () => {
  it.skip('should render app', () => {
    const { getByTestId } = renderMultiplayerProvider(<App />);
    expect(getByTestId('app-root')).toBeTruthy();
  });
});
