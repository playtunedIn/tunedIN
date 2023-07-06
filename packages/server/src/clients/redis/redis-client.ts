import { createClient } from 'redis';

export const redisPub = async (channel: string, data: string) => {
  const client = createClient({
    url: 'redis://localhost:6379',
  });
  await client.connect();

  await client.publish(channel, data);
};

export const redisSub = async (channel: string, fn: (message: string) => void) => {
  const client = createClient({
    url: 'redis://localhost:6379',
  });
  const subscriber = client.duplicate();
  await subscriber.connect();

  await subscriber.subscribe(channel, fn);
};
