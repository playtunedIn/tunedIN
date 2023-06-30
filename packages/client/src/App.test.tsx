import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';

describe('Sanity Test Suite', () => {
  it('should render app', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('app-root')).toBeTruthy();
  });
});
