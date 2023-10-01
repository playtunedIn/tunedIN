import type { RedisJSON } from '@redis/json/dist/commands';

import type { RedisClient } from '.';
import type { RedisQuery } from './redis.constants';
import { REDIS_ERROR_CODES } from '../../errors';

/**
 * Calls Redis for the following query's property
 *
 * @param roomId room id used as key to redis state
 * @param query property of state to query
 * @returns first found value that matches query
 */
export const query = async <T>(roomId: string, query: RedisQuery, client: RedisClient): Promise<T> => {
  let response: RedisJSON[];
  try {
    response = (await client.json.get(roomId, { path: query })) as RedisJSON[];
  } catch {
    throw new Error(REDIS_ERROR_CODES.COMMAND_FAILURE);
  }

  if (response?.[0] === null) {
    throw new Error(REDIS_ERROR_CODES.KEY_NOT_FOUND);
  }

  return response[0] as T;
};

/**
 * Calls Redis for the following queries' properties
 *
 * @param roomId room id used as key to redis state
 * @param queries properties of state to query
 * @returns first found value that matches queries
 */
export const queryMultiple = async (
  roomId: string,
  queries: RedisQuery[],
  client: RedisClient
): Promise<Record<RedisQuery, unknown>> => {
  let response: Record<string, RedisJSON[]>;
  try {
    response = (await client.json.get(roomId, { path: queries })) as Record<string, RedisJSON[]>;
  } catch {
    throw new Error(REDIS_ERROR_CODES.COMMAND_FAILURE);
  }

  const keyNotFound = queries.some(query => response?.[query]?.[0] == null);
  if (keyNotFound) {
    throw new Error(REDIS_ERROR_CODES.KEY_NOT_FOUND);
  }

  return Object.keys(response).reduce((result: Record<string, unknown>, queryKey: string) => {
    result[queryKey] = response[queryKey][0];
    return result;
  }, {} as Record<string, unknown>);
};
