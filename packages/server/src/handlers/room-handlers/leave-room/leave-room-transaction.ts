import type { GameState, PlayerState } from 'src/clients/redis/models/game-state';
import { sanitizeRoomState } from '../../../utils/room-helpers';
import { REDIS_ERROR_CODES } from '../../../errors';
import {
  ROOT_QUERY,
  executeTransaction,
  gameStatePublisherClient,
  playerStatePublisherClient,
  query,
  createPlayerQuery,
} from '../../../clients/redis';

const LEAVE_ROOM_TRANSACTION_ATTEMPTS = 10;

export const leaveRoomTransaction = (roomId: string, userId: string) =>
  executeTransaction(LEAVE_ROOM_TRANSACTION_ATTEMPTS, async () => {
    await gameStatePublisherClient.watch(roomId);

    const roomState = await query<GameState>(roomId, ROOT_QUERY, gameStatePublisherClient);

    const playerIndex = roomState.players.findIndex(player => player.userId === userId);
    roomState.players.splice(playerIndex);

    const transaction = gameStatePublisherClient.multi();
    transaction.json.arrPop(roomId, createPlayerQuery(playerIndex));

    // if last player in room, delete room
    if (!roomState.players.length) {
      transaction.json.del(roomId, ROOT_QUERY);
    }

    const result = await transaction.exec();
    if (result === null) {
      throw new Error(REDIS_ERROR_CODES.TRANSACTION_KEY_CHANGE);
    }

    return sanitizeRoomState(roomState);
  });
export const leaveRoomPlayerTransaction = (userId: string) =>
  executeTransaction(LEAVE_ROOM_TRANSACTION_ATTEMPTS, async () => {
    await playerStatePublisherClient.watch(userId);

    const playerState = await query<PlayerState>(userId, ROOT_QUERY, playerStatePublisherClient);
    const transaction = playerStatePublisherClient.multi();
    const newPlayerState = {
      ...playerState,
      roomId: null,
    };
    transaction.json.set(userId, ROOT_QUERY, newPlayerState);

    const result = await transaction.exec();
    if (result === null) {
      throw new Error(REDIS_ERROR_CODES.TRANSACTION_KEY_CHANGE);
    }

    return newPlayerState;
  });
