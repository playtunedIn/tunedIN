import { createClient } from 'redis';

export type RedisClient = ReturnType<typeof createClient>;

export interface ChannelListener {
  channel: string;
  listener: (message: string) => void;
}

let redisPubClient: RedisClient;
let redisSubClient: RedisClient;

const getRedisClient = async (): Promise<RedisClient> => {
  if (!redisPubClient) {
    redisPubClient = createClient({
      url: 'redis://localhost:6379',
    });
    await redisPubClient.connect();
  }

  return redisPubClient;
};

const getRedisSubscriberClient = async (): Promise<RedisClient> => {
  if (!redisSubClient) {
    redisSubClient = createClient({
      url: 'redis://localhost:6379',
    });
    await redisSubClient.connect();
  }

  return redisSubClient;
};

const publishChannel = async (channel: string, data: string) => {
  const client = await getRedisClient();

  await client.publish(channel, data);
};

/**
 * NOTE: This must be passed in by reference (passing in the whole object). Or else the listener will lose its connection to the websocket
 */
const subscribeChannel = async (channelListener: ChannelListener) => {
  const client = await getRedisSubscriberClient();

  return client.subscribe(channelListener.channel, channelListener.listener);
};

const unsubscribeChannel = async (channelListener: ChannelListener) => {
  const client = await getRedisSubscriberClient();

  return client.unsubscribe(channelListener.channel, channelListener.listener);
};

const getValue = async (key: string) => {
  const client = await getRedisClient();
  return client.get(key);
};

const setValue = async (key: string, value: string) => {
  const client = await getRedisClient();
  await client.set(key, value);
};

export { publishChannel, subscribeChannel, unsubscribeChannel, getValue, setValue };
