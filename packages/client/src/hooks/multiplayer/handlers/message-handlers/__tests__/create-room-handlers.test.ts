import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useCreateRoomResponseHandlers } from '../create-room-handlers';

const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe('Create Room Handlers', () => {
  beforeEach(() => {
    console.log = vi.fn();
    console.error = vi.fn();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    vi.restoreAllMocks();
  });

  it('should call console log', () => {
    const { createRoomResponseHandler } = useCreateRoomResponseHandlers();

    createRoomResponseHandler({ roomId: 'test' });
    expect(console.log).toHaveBeenCalled();
  });

  it('should call console error', () => {
    const { createRoomErrorResponseHandler } = useCreateRoomResponseHandlers();

    createRoomErrorResponseHandler({ errorCode: 'test' });
    expect(console.error).toHaveBeenCalled();
  });
});
