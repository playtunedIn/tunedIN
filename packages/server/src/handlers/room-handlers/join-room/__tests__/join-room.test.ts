import type { WebSocket } from 'ws';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { joinRoomHandler } from 'src/handlers/room-handlers/join-room/join-room';
import { createMockWebSocket, createMockWebSocketMessage } from '../../../../testing/mocks/websocket.mock';
import { JOIN_ROOM_ERROR_RESPONSE, JOIN_ROOM_RESPONSE } from 'src/handlers/room-handlers/types/response';
import { JOIN_ROOM_ERROR_CODES, REDIS_ERROR_CODES } from '../../../../errors';
import type { JoinRoomReq } from '../join-room.validator';
import { gameStatePublisherClient } from '../../../../clients/redis';
import * as joinRoomTransactionMock from '../join-room-transaction';
import type { PlayerState } from 'src/clients/redis/models/game-state';

describe('Join Room Handler', () => {
  let ws: WebSocket;
  let mockJoinRoomReq: JoinRoomReq;
  beforeEach(() => {
    ws = createMockWebSocket();
    mockJoinRoomReq = {
      roomId: 'test room id',
      playerId: 'test player',
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
    const mockPlayers: PlayerState[] = [
      {
        playerId: mockJoinRoomReq.playerId,
        name: 'Joe Smith',
        score: 0,
        answers: [],
      },
    ];
    vi.spyOn(gameStatePublisherClient, 'exists').mockResolvedValueOnce(1);
    vi.spyOn(joinRoomTransactionMock, 'joinRoomTransaction').mockResolvedValueOnce(mockPlayers);

    await joinRoomHandler(ws, mockJoinRoomReq);

    expect(ws.send).toHaveBeenCalledWith(createMockWebSocketMessage(JOIN_ROOM_RESPONSE, mockPlayers));
  });
});
