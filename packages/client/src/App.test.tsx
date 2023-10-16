import { describe, it, expect } from 'vitest';

import { renderMultiplayerProvider } from '@testing/helpers/multiplayer-helpers';
import App from './App';

describe('Sanity Test Suite', () => {
  it('should render app', () => {
    const { getByText } = renderMultiplayerProvider(<App />);
    expect(getByText('LETS PLAY TUNEDIN')).toBeTruthy();
  });
});
