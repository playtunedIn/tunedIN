import { useUpdatePlayersHandlers } from '@hooks/multiplayer/handlers/message-handlers/subscriber-updates/update-players';
import { useUpdateRoomHandlers } from '@hooks/multiplayer/handlers/message-handlers/subscriber-updates/update-room';

export const useSubscriberHandler = () => {
  const { addPlayerHandler } = useUpdatePlayersHandlers();
  const { updateRoomStatusHandler } = useUpdateRoomHandlers();

  const updateHandlers = {
    addPlayerResponse: addPlayerHandler,
    updateRoomStatusResponse: updateRoomStatusHandler,
  } as const;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscribedMessageResponse = (payload: { type: keyof typeof updateHandlers; data: any }) => {
    if (updateHandlers[payload.type]) {
      updateHandlers[payload.type](payload.data);
    } else {
      console.error(`Unknown subscribed message type: ${payload.type}`);
    }
  };

  return { subscribedMessageResponse };
};
