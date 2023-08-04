import { useCreateRoomResponseHandlers } from './message-handlers/create-room-handlers';
import { useExitRoomResponseHandlers } from './message-handlers/exit-room-handlers';

export const useSocketMessageHandlers = () => {
  const { createRoomResponseHandler, createRoomErrorResponseHandler } = useCreateRoomResponseHandlers();
  const { exitRoomResponseHandler, exitRoomErrorResponseHandler } = useExitRoomResponseHandlers();

  const messageHandlers = {
    createRoomResponse: createRoomResponseHandler,
    createRoomErrorResponse: createRoomErrorResponseHandler,
    exitRoomResponse: exitRoomResponseHandler,
    exitRoomErrorResponseHandler: exitRoomErrorResponseHandler,
  } as const;

  return { messageHandlers };
};
