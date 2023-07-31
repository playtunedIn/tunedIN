/**
 * TODO: These types are not accurate. Implement exit room handler in SPOT-49
 */

interface ExitRoomResponse {
  roomId: string;
}

interface ExitRoomErrorResponse {
  errorCode: string;
}

export const useExitRoomResponseHandlers = () => {
  const exitRoomResponseHandler = (data: ExitRoomResponse) => {
    console.log(data);
  };

  const exitRoomErrorResponseHandler = (data: ExitRoomErrorResponse) => {
    console.error(data);
  };

  return {
    exitRoomResponseHandler,
    exitRoomErrorResponseHandler,
  };
};
