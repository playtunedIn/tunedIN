import { useUpdatePlayersHandlers } from '@hooks/multiplayer/handlers/message-handlers/subscriber-updates/update-players';
import { useUpdateQuestionsHandlers } from '@hooks/multiplayer/handlers/message-handlers/subscriber-updates/update-questions';
import { useUpdateRoomHandlers } from '@hooks/multiplayer/handlers/message-handlers/subscriber-updates/update-room';

export const useSubscriberHandler = () => {
  const { addPlayerHandler, updateRoundResultsHandler, playerAnsweredQuestionHandler } = useUpdatePlayersHandlers();
  const { updateRoomStatusHandler } = useUpdateRoomHandlers();
  const { updateCurrentQuestionHandler } = useUpdateQuestionsHandlers();

  const updateHandlers = {
    addPlayerResponse: addPlayerHandler,
    playerAnsweredQuestionResponse: playerAnsweredQuestionHandler,
    updateRoomStatusResponse: updateRoomStatusHandler,
    updateRoundResultsResponse: updateRoundResultsHandler,
    updateQuestionResponse: updateCurrentQuestionHandler,
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
