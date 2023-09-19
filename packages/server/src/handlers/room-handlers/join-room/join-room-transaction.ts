import type { RedisJSON } from '@redis/json/dist/commands';

import type { PlayerState } from 'src/clients/redis/models/game-state';
import { JOIN_ROOM_ERROR_CODES, REDIS_ERROR_CODES } from '../../../errors';
import { executeTransaction, gameStatePublisherClient } from '../../../clients/redis';
import { createNewPlayerState } from '../../../utils/room-helpers';

const PLAYER_LIMIT = 4;
const JOIN_ROOM_TRANSACTION_ATTEMPTS = 10;

export const joinRoomTransaction = (roomId: string, playerId: string) =>
  executeTransaction(JOIN_ROOM_TRANSACTION_ATTEMPTS, async () => {
    await gameStatePublisherClient.watch(roomId);

    const response = (await gameStatePublisherClient.json.get(roomId, {
      path: '$.players',
    })) as RedisJSON[];
    if (response[0] === null) {
      throw new Error(REDIS_ERROR_CODES.KEY_NOT_FOUND);
    }

    const players = response[0] as unknown as PlayerState[];

    if (players.some(player => player.playerId === playerId)) {
      throw new Error(JOIN_ROOM_ERROR_CODES.PLAYER_ALREADY_IN_ROOM);
    }

    if (players.length >= PLAYER_LIMIT) {
      throw new Error(JOIN_ROOM_ERROR_CODES.ROOM_FULL);
    }

    const newPlayer = createNewPlayerState(playerId);
    players.push(newPlayer);

    const transaction = gameStatePublisherClient.multi();
    transaction.json.arrAppend(roomId, '$.players', newPlayer as unknown as RedisJSON);
    // TODO: Functionally Test this a lot we want to make sure it actually returns null
    const result = await transaction.exec();
    if (result === null) {
      throw new Error(REDIS_ERROR_CODES.TRANSACTION_KEY_CHANGE);
    }

    return players;
  });
