import { REDIS_ERROR_CODES, UNKNOWN_ERROR } from '../../errors';

export const executeTransaction = async <T>(attempts: number, transaction: () => Promise<T>): Promise<T> => {
  let currentAttempt = 0;
  while (currentAttempt < attempts) {
    try {
      return await transaction();
    } catch (err) {
      if (!(err instanceof Error)) {
        throw new Error(UNKNOWN_ERROR);
      }

      if (!err.message.startsWith('MULT-')) {
        throw new Error(REDIS_ERROR_CODES.COMMAND_FAILURE);
      }

      if (err.message === REDIS_ERROR_CODES.TRANSACTION_KEY_CHANGE) {
        currentAttempt++;
        continue;
      }

      throw err;
    }
  }

  throw new Error(REDIS_ERROR_CODES.TRANSACTION_ATTEMPT_LIMIT_REACHED);
};
