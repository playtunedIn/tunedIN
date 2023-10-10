import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSubscriberHandler } from '@hooks/multiplayer/handlers/message-handlers/subscriber-updates/subscriber-handler';
import { setupStore } from '@store/store';
import { wrapMultiplayerProvider } from '@testing/helpers/multiplayer-helpers';

const originalConsoleError = console.error;

describe('Subscriber Handler', () => {
  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('should fail to call an update handler', () => {
    const payload = {
      type: 'NO HANDLER',
    } as any;

    const store = setupStore();
    const { result, unmount } = renderHook(() => useSubscriberHandler(), {
      wrapper: wrapMultiplayerProvider({ store }),
    });

    result.current.subscribedMessageResponse(payload);

    expect(console.error).toHaveBeenCalled();

    unmount();
  });
});
