import { executeTransaction } from 'src/clients/redis/transactions';
import { REDIS_ERROR_CODES, UNKNOWN_ERROR } from 'src/errors';
import { describe, expect, it, vi } from 'vitest';

describe('Transactions', () => {
  it('should throw unknown error for non error catches', async () => {
    await expect(() =>
      executeTransaction(1, () => {
        throw new Response('not an error');
      })
    ).rejects.toThrowError(UNKNOWN_ERROR);
  });

  it('should handle redis command failures', async () => {
    await expect(() =>
      executeTransaction(1, () => {
        throw new Error('non multiplayer business error');
      })
    ).rejects.toThrowError(REDIS_ERROR_CODES.COMMAND_FAILURE);
  });

  it('should return error for transaction attempt limits', async () => {
    await expect(() => executeTransaction(0, vi.fn())).rejects.toThrowError(
      REDIS_ERROR_CODES.TRANSACTION_ATTEMPT_LIMIT_REACHED
    );
  });

  it('returns transaction return value', async () => {
    await expect(executeTransaction(1, () => new Promise(resolve => resolve(true)))).resolves.toEqual(true);
  });
});
