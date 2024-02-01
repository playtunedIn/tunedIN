import type { WebSocket } from 'ws';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { leaveRoomHandler } from 'src/handlers/room-handlers/leave-room/leave-room';
import { createMockWebSocket, createMockWebSocketMessage } from '../../../../testing/mocks/websocket.mock';
import { LEAVE_ROOM_ERROR_RESPONSE, LEAVE_ROOM_RESPONSE } from 'src/handlers/responses';
import { query } from '../../../../clients/redis/query-helpers';
import * as leaveRoomTransactionMock from '../leave-room-transaction';
import { createMockGameState } from '../../../../testing/mocks/redis-client.mock';
import { sanitizeRoomState } from '../../../../utils/room-helpers';

vi.mock('../../../../clients/redis/query-helpers');

describe('Leave Room Handler', () => {
  let ws: WebSocket;
  beforeEach(() => {
    ws = createMockWebSocket();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it.skip('could not find room', async () => {
    (query as Mock).mockResolvedValueOnce([{}]);

    await leaveRoomHandler(ws);

    expect(ws.send).toHaveBeenCalledWith(
      createMockWebSocketMessage(LEAVE_ROOM_ERROR_RESPONSE, { errorCode: 'Player not in any room' })
    );
  });

  it('should leave room', async () => {
    const mockRoomState = createMockGameState();
    const sanitizedRoomState = sanitizeRoomState(mockRoomState);

    const playerState = { roomId: null };

    (query as Mock).mockResolvedValueOnce({ roomId: 123 });
    (query as Mock).mockResolvedValueOnce({});
    vi.spyOn(leaveRoomTransactionMock, 'leaveRoomTransaction').mockResolvedValueOnce(sanitizedRoomState);
    vi.spyOn(leaveRoomTransactionMock, 'leaveRoomPlayerTransaction').mockResolvedValueOnce(playerState);

    await leaveRoomHandler(ws);

    expect(ws.send).toHaveBeenCalledWith(createMockWebSocketMessage(LEAVE_ROOM_RESPONSE, sanitizedRoomState));
  });
});
