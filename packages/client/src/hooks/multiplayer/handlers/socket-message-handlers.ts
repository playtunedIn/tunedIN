import { useRecoverRoomSessionHandlers } from '@hooks/multiplayer/handlers/message-handlers/recover-room-handlers';
import { useCreateRoomResponseHandlers } from './message-handlers/create-room-handlers';
import { useExitRoomResponseHandlers } from './message-handlers/exit-room-handlers';

export const useSocketMessageHandlers = (setNeedsRecovery: React.Dispatch<React.SetStateAction<boolean>>) => {
  const { createRoomResponseHandler, createRoomErrorResponseHandler } = useCreateRoomResponseHandlers();
  const { exitRoomResponseHandler, exitRoomErrorResponseHandler } = useExitRoomResponseHandlers();
  const { recoverRoomSessionResponseHandler, recoverRoomSessionErrorResponseHandler } =
    useRecoverRoomSessionHandlers(setNeedsRecovery);

  /**
   * Key names must match the response type for the handler
   */
  const messageHandlers = {
    createRoomResponse: createRoomResponseHandler,
    createRoomErrorResponse: createRoomErrorResponseHandler,
    exitRoomResponse: exitRoomResponseHandler,
    exitRoomErrorResponse: exitRoomErrorResponseHandler,
    recoverRoomSessionResponse: recoverRoomSessionResponseHandler,
    recoverRoomSessionErrorResponse: recoverRoomSessionErrorResponseHandler,
  } as const;

  return { messageHandlers };
};
