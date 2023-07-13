import { createClient } from 'redis';
import { afterEach, beforeEach, describe, it, expect, vi, Mock } from 'vitest';

import { publishChannel, subscribeChannel, unsubscribeChannel, getValue, setValue } from './redis-client';

vi.mock('redis');

describe('Redis Client Suite', () => {
  const publishSpy = vi.fn();
  const subscribeSpy = vi.fn();
  const unsubscribeSpy = vi.fn();
  const getSpy = vi.fn();
  const setSpy = vi.fn();

  beforeEach(() => {
    (createClient as Mock).mockImplementation(() => ({
      connect: vi.fn(),
      publish: publishSpy,
      subscribe: subscribeSpy,
      unsubscribe: unsubscribeSpy,
      get: getSpy,
      set: setSpy,
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should subscribe to channel', async () => {
    await subscribeChannel({ channel: 'test', listener: vi.fn() });
    expect(subscribeSpy).toHaveBeenCalledOnce();
  });

  it('should publish to channel', async () => {
    await publishChannel('test', 'test data');
    expect(publishSpy).toHaveBeenCalledOnce();
  });

  it('should unsubscribe from channel', async () => {
    await unsubscribeChannel({ channel: 'test', listener: vi.fn() });
    expect(unsubscribeSpy).toHaveBeenCalledOnce();
  });

  it('should get value from redis', async () => {
    const expectedData = 'test';
    getSpy.mockImplementationOnce(() => expectedData);
    expect(await getValue('key')).toEqual(expectedData);
  });

  it('should set value to redis', async () => {
    await setValue('key', 'value');
    expect(setSpy).toHaveBeenCalledOnce();
  });
});
