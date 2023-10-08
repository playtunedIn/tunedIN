import type { RedisJSON } from '@redis/json/dist/commands';

import type { GameState, PlayerState } from 'src/clients/redis/models/game-state';
import { sanitizeRoomState } from '../../../utils/room-helpers';
import { JOIN_ROOM_ERROR_CODES, REDIS_ERROR_CODES } from '../../../errors';
import { PLAYERS_QUERY, ROOT_QUERY, executeTransaction, gameStatePublisherClient, query } from '../../../clients/redis';

const PLAYER_LIMIT = 4;
const JOIN_ROOM_TRANSACTION_ATTEMPTS = 10;

export const joinRoomTransaction = (roomId: string, newPlayer: PlayerState) =>
  executeTransaction(JOIN_ROOM_TRANSACTION_ATTEMPTS, async () => {
    await gameStatePublisherClient.watch(roomId);

    const roomState = await query<GameState>(roomId, ROOT_QUERY, gameStatePublisherClient);

    if (roomState.players.some(player => player.userId === newPlayer.userId)) {
      throw new Error(JOIN_ROOM_ERROR_CODES.PLAYER_ALREADY_IN_ROOM);
    }

    if (roomState.players.some(player => player.name === newPlayer.name)) {
      throw new Error(JOIN_ROOM_ERROR_CODES.NAME_TAKEN);
    }

    if (roomState.players.length >= PLAYER_LIMIT) {
      throw new Error(JOIN_ROOM_ERROR_CODES.ROOM_FULL);
    }

    roomState.players.push(newPlayer);

    const transaction = gameStatePublisherClient.multi();
    transaction.json.arrAppend(roomId, PLAYERS_QUERY, newPlayer as unknown as RedisJSON);
    // TODO: Functionally Test this a lot we want to make sure it actually returns null
    const result = await transaction.exec();
    if (result === null) {
      throw new Error(REDIS_ERROR_CODES.TRANSACTION_KEY_CHANGE);
    }

    return sanitizeRoomState(roomState);
  });
