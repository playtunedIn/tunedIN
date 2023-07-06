import { createClient } from 'redis';
import { beforeEach, describe, it, expect, vi, Mock } from 'vitest';

import { redisPub, redisSub } from './redis-client';

vi.mock('redis');

describe('Redis Client Suite', () => {
  const publishSpy = vi.fn();
  const subscribeSpy = vi.fn();

  beforeEach(() => {
    (createClient as Mock).mockImplementation(() => ({
      connect: vi.fn(),
      publish: publishSpy,
      duplicate: () => ({
        connect: vi.fn(),
        subscribe: subscribeSpy,
      }),
    }));

    publishSpy.mockClear();
    subscribeSpy.mockClear();
  });

  it('should subscribe to channel', async () => {
    await redisSub('test', vi.fn());
    expect(subscribeSpy).toHaveBeenCalledOnce();
  });

  it('should publish to channel', async () => {
    await redisPub('test', 'test data');
    expect(publishSpy).toHaveBeenCalledOnce();
  });
});
