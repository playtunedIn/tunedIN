import { createClient } from 'redis';

type RedisClientType = ReturnType<typeof createClient>;

export interface ChannelListener {
  channel: string;
  listener: (message: string) => void;
}

const REDIS_HOSTNAME = process.env.REDIS_HOSTNAME || 'redis://local.playtunedin-test.com:6379';
export const REDIS_DB_MAP = {
  gameState: 0,
  playerState: 1,
} as const;

class RedisClient {
  protected client: RedisClientType;

  constructor(database: (typeof REDIS_DB_MAP)[keyof typeof REDIS_DB_MAP], name: string) {
    this.client = createClient({
      name,
      url: REDIS_HOSTNAME,
      database,
    });

    this.client.addListener('error', (error: Error) => {
      console.error(`redis client: ${name} encountered error: ${error}`);
    });

    this.client.addListener('end', () => {
      this.client.removeAllListeners();
    });

    this.connect();
  }

  private connect = async () => {
    await this.client.connect();
  };
}

export class RedisPublisherClient extends RedisClient {
  constructor(database: (typeof REDIS_DB_MAP)[keyof typeof REDIS_DB_MAP], name: string) {
    super(database, name);
  }

  publishChanges = async (channel: string, data: string) => {
    await this.client.publish(channel, data);
  };

  get = (key: string) => this.client.get(key);

  set = (key: string, value: string) => this.client.set(key, value);
}

export class RedisSubscriberClient extends RedisClient {
  constructor(database: (typeof REDIS_DB_MAP)[keyof typeof REDIS_DB_MAP], name: string) {
    super(database, name);
  }

  /**
   * NOTE: This must be passed in by reference (passing in the whole object). Or else the listener will lose its connection to the websocket
   */
  subscribeToChanges = (channelListener: ChannelListener) =>
    this.client.subscribe(channelListener.channel, channelListener.listener);

  unsubscribeFromChanges = (channelListener: ChannelListener) =>
    this.client.unsubscribe(channelListener.channel, channelListener.listener);
}
