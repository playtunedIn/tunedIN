import type { WebSocket } from 'ws';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { joinRoomHandler } from 'src/handlers/room-handlers/join-room/join-room';
import { createMockWebSocket, createMockWebSocketMessage } from '../../../../testing/mocks/websocket.mock';
import { JOIN_ROOM_ERROR_RESPONSE, JOIN_ROOM_RESPONSE } from 'src/handlers/responses';
import { JOIN_ROOM_ERROR_CODES, REDIS_ERROR_CODES } from '../../../../errors';
import type { JoinRoomReq } from '../join-room.validator';
import { gameStatePublisherClient } from '../../../../clients/redis';
import * as joinRoomTransactionMock from '../join-room-transaction';
import { createMockGameState } from '../../../../testing/mocks/redis-client.mock';
import { sanitizeRoomState } from '../../../../utils/room-helpers';

describe('Join Room Handler', () => {
  let ws: WebSocket;
  let mockJoinRoomReq: JoinRoomReq;
  beforeEach(() => {
    ws = createMockWebSocket();
    mockJoinRoomReq = {
      roomId: 'TEST',
      name: 'Joe Smith',
    };
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('has an invalid data schema', async () => {
    await joinRoomHandler(ws, {} as JoinRoomReq);

    expect(ws.send).toHaveBeenCalledWith(
      createMockWebSocketMessage(JOIN_ROOM_ERROR_RESPONSE, { errorCode: JOIN_ROOM_ERROR_CODES.INVALID_ROOM_REQ })
    );
  });

  it('does accept all spaces for name', async () => {
    mockJoinRoomReq.name = '   ';

    await joinRoomHandler(ws, mockJoinRoomReq);

    expect(ws.send).toHaveBeenCalledWith(
      createMockWebSocketMessage(JOIN_ROOM_ERROR_RESPONSE, { errorCode: JOIN_ROOM_ERROR_CODES.INVALID_ROOM_REQ })
    );
  });

  it('fails to call redis "exist" command', async () => {
    vi.spyOn(gameStatePublisherClient, 'exists').mockRejectedValueOnce('');

    await joinRoomHandler(ws, mockJoinRoomReq);

    expect(ws.send).toHaveBeenCalledWith(
      createMockWebSocketMessage(JOIN_ROOM_ERROR_RESPONSE, { errorCode: REDIS_ERROR_CODES.COMMAND_FAILURE })
    );
  });

  it('could not find room', async () => {
    vi.spyOn(gameStatePublisherClient, 'exists').mockResolvedValueOnce(0);

    await joinRoomHandler(ws, mockJoinRoomReq);

    expect(ws.send).toHaveBeenCalledWith(
      createMockWebSocketMessage(JOIN_ROOM_ERROR_RESPONSE, { errorCode: JOIN_ROOM_ERROR_CODES.ROOM_NOT_FOUND })
    );
  });

  it('could not complete transaction', async () => {
    vi.spyOn(gameStatePublisherClient, 'exists').mockResolvedValueOnce(1);
    vi.spyOn(joinRoomTransactionMock, 'joinRoomTransaction').mockRejectedValueOnce(
      new Error(JOIN_ROOM_ERROR_CODES.ROOM_FULL)
    );

    await joinRoomHandler(ws, mockJoinRoomReq);

    expect(ws.send).toHaveBeenCalledWith(
      createMockWebSocketMessage(JOIN_ROOM_ERROR_RESPONSE, { errorCode: JOIN_ROOM_ERROR_CODES.ROOM_FULL })
    );
  });

  it('should join room', async () => {
    const mockRoomState = createMockGameState();
    const sanitizedRoomState = sanitizeRoomState(mockRoomState);

    vi.spyOn(gameStatePublisherClient, 'exists').mockResolvedValueOnce(1);
    vi.spyOn(joinRoomTransactionMock, 'joinRoomTransaction').mockResolvedValueOnce(sanitizedRoomState);

    await joinRoomHandler(ws, mockJoinRoomReq);

    expect(ws.send).toHaveBeenCalledWith(createMockWebSocketMessage(JOIN_ROOM_RESPONSE, sanitizedRoomState));
  });
});
