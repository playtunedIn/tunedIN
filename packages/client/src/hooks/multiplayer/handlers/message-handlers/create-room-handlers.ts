/**
 * TODO: These types are not accurate. Implement create room handlers in SPOT-46
 */

interface CreateRoomResponse {
  roomId: string;
}

interface CreateRoomErrorResponse {
  errorCode: string;
}

export const useCreateRoomResponseHandlers = () => {
  const createRoomResponseHandler = (data: CreateRoomResponse) => {
    console.log(data);
  };

  const createRoomErrorResponseHandler = (data: CreateRoomErrorResponse) => {
    console.error(data);
  };

  return {
    createRoomResponseHandler,
    createRoomErrorResponseHandler,
  };
};
