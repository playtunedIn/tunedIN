import type { WebSocket } from 'ws';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { publishMessageHandler, subscribeRoomHandler, unsubscribeRoomHandler } from '../subscribed-message-handlers';
import { createMockWebSocket, createMockWebSocketMessage } from '../../testing/mocks/websocket.mock';
import { ADD_PLAYER_RESPONSE, SUBSCRIBED_RESPONSE } from '../room-handlers/types/response';
import { REDIS_ERROR_CODES } from '../../errors';
import { gameStatePublisherClient, gameStateSubscriberClient } from '../../clients/redis';
import { createMockPublisherPayload } from '../../testing/mocks/redis-client.mock';

describe('Subscribed Message Handlers', () => {
  const mockRoomId = 'mock room';
  const mockUserId = 'mock user';

  let ws: WebSocket;
  beforeEach(() => {
    ws = createMockWebSocket();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('publishMessageHandler', () => {
    it('throws an error when unable to stringify payload', async () => {
      const mockData: Record<string, unknown> = {};
      mockData.circularRef = mockData;

      await expect(() =>
        publishMessageHandler(mockRoomId, mockUserId, ADD_PLAYER_RESPONSE, mockData)
      ).rejects.toThrowError(REDIS_ERROR_CODES.CORRUPT_STRINGIFY);
    });

    it('publishes payload', async () => {
      vi.spyOn(gameStatePublisherClient, 'publish').mockResolvedValueOnce(1);

      await publishMessageHandler(mockRoomId, mockUserId, ADD_PLAYER_RESPONSE, {});

      await expect(gameStatePublisherClient.publish).toHaveBeenCalledWith(
        mockRoomId,
        createMockPublisherPayload(mockUserId, ADD_PLAYER_RESPONSE, {})
      );
    });
  });

  describe('subscribeRoomHandler', () => {
    it('does not send response if payload is not parseable', async () => {
      vi.spyOn(gameStateSubscriberClient, 'subscribe').mockImplementation(
        async (_: string | string[], listener: any): Promise<void> => {
          await listener('not json');
        }
      );

      await subscribeRoomHandler(ws, mockRoomId);

      expect(ws.send).not.toHaveBeenCalled();
    });

    it('does not send response if payload is from self', async () => {
      vi.spyOn(gameStateSubscriberClient, 'subscribe').mockImplementation(
        async (_: string | string[], listener: any): Promise<void> => {
          await listener(createMockPublisherPayload(mockUserId, ADD_PLAYER_RESPONSE, {}));
        }
      );

      ws.userToken.userId = mockUserId;
      await subscribeRoomHandler(ws, mockRoomId);

      expect(ws.send).not.toHaveBeenCalled();
    });

    it('should send publish subscribed response', async () => {
      vi.spyOn(gameStateSubscriberClient, 'subscribe').mockImplementation(
        async (_: string | string[], listener: any): Promise<void> => {
          await listener(createMockPublisherPayload(mockUserId, ADD_PLAYER_RESPONSE, {}));
        }
      );

      await subscribeRoomHandler(ws, mockRoomId);

      expect(ws.send).toHaveBeenCalledWith(
        createMockWebSocketMessage(SUBSCRIBED_RESPONSE, { type: ADD_PLAYER_RESPONSE, data: {} })
      );
    });
  });

  describe('unsubscribeRoomHandler', () => {
    it('should not call redis unsubscribe when no channelListener', async () => {
      await unsubscribeRoomHandler(ws);

      expect(gameStateSubscriberClient.unsubscribe).not.toHaveBeenCalled();
    });

    it('should call redis unsubscribe when channelListener', async () => {
      const listener = vi.fn();
      ws.channelListener = {
        channel: mockRoomId,
        listener,
      };

      await unsubscribeRoomHandler(ws);

      expect(gameStateSubscriberClient.unsubscribe).toHaveBeenCalledWith(mockRoomId, listener);
    });
  });
});
