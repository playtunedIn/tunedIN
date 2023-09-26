import type { MessageHandlerResponse } from '../handlers/responses';
import type { WebSocket } from 'ws';

export const sendResponse = <T extends object>(ws: WebSocket, responseType: MessageHandlerResponse, data: T): void => {
  const response = {
    type: responseType,
    data,
  };

  try {
    const responseJson = JSON.stringify(response);
    ws.send(responseJson);
  } catch (stringifyError) {
    console.error('Error while stringifying response JSON:', stringifyError);
  }
};
