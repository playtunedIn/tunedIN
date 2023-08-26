import { afterEach, describe, it, expect, vi } from 'vitest';

import { redisClientMock } from '../../testing/mocks/redis-client.mock';
import { gameStatePublisherClient, gameStateSubscriberClient } from '.';

describe('Redis Client Suite', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should subscribe to channel', async () => {
    await gameStateSubscriberClient.subscribeToChanges({ channel: 'test', listener: vi.fn() });
    expect(redisClientMock.subscribe).toHaveBeenCalledOnce();
  });

  it('should publish to channel', async () => {
    await gameStatePublisherClient.publishChanges('test', 'test data');
    expect(redisClientMock.publish).toHaveBeenCalledOnce();
  });

  it('should unsubscribe from channel', async () => {
    await gameStateSubscriberClient.unsubscribeFromChanges({ channel: 'test', listener: vi.fn() });
    expect(redisClientMock.unsubscribe).toHaveBeenCalledOnce();
  });

  it('should get value from redis', async () => {
    const expectedData = 'test';
    redisClientMock.get.mockReturnValue(expectedData);
    expect(await gameStatePublisherClient.get('key')).toEqual(expectedData);
  });

  it('should set value to redis', async () => {
    await gameStatePublisherClient.set('key', 'value');
    expect(redisClientMock.set).toHaveBeenCalledOnce();
  });
});
