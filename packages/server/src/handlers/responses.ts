// Root level message handlers responses
export const CREATE_ROOM_RESPONSE = 'joinRoomResponse';
export const CREATE_ROOM_ERROR_RESPONSE = 'joinRoomErrorResponse';
export const JOIN_ROOM_RESPONSE = 'joinRoomResponse';
export const JOIN_ROOM_ERROR_RESPONSE = 'joinRoomErrorResponse';
export const RECOVER_ROOM_SESSION_RESPONSE = 'recoverRoomSessionResponse';
export const RECOVER_ROOM_SESSION_ERROR_RESPONSE = 'recoverRoomSessionErrorResponse';
export const SUBSCRIBED_RESPONSE = 'subscribedResponse';
export const START_GAME_ERROR_RESPONSE = 'startRoomErrorResponse';
export const GET_QUESTIONS_ERROR_RESPONSE = 'getQuestionsErrorResponse';
export const ANSWER_QUESTION_RESPONSE = 'answerQuestionResponse';
export const ANSWER_QUESTION_ERROR_RESPONSE = 'answerQuestionErrorResponse';

export type MessageHandlerResponse =
  | typeof CREATE_ROOM_RESPONSE
  | typeof CREATE_ROOM_ERROR_RESPONSE
  | typeof JOIN_ROOM_RESPONSE
  | typeof JOIN_ROOM_ERROR_RESPONSE
  | typeof RECOVER_ROOM_SESSION_RESPONSE
  | typeof RECOVER_ROOM_SESSION_ERROR_RESPONSE
  | typeof SUBSCRIBED_RESPONSE
  | typeof START_GAME_ERROR_RESPONSE
  | typeof GET_QUESTIONS_ERROR_RESPONSE
  | typeof ANSWER_QUESTION_RESPONSE
  | typeof ANSWER_QUESTION_ERROR_RESPONSE;

// Publisher message handler responses
export const ADD_PLAYER_RESPONSE = 'addPlayerResponse';
export const REMOVE_PLAYER_RESPONSE = 'removePlayerResponse';
export const PLAYER_ANSWERED_QUESTION_RESPONSE = 'playerAnsweredQuestionResponse';
export const UPDATE_ROOM_STATUS_RESPONSE = 'updateRoomStatusResponse';

export type SubscribedMessageHandlerResponse =
  | typeof ADD_PLAYER_RESPONSE
  | typeof REMOVE_PLAYER_RESPONSE
  | typeof PLAYER_ANSWERED_QUESTION_RESPONSE
  | typeof UPDATE_ROOM_STATUS_RESPONSE
  | typeof GET_QUESTIONS_ERROR_RESPONSE;

export interface SubscribedMessagePayload {
  userId?: string;
  type: SubscribedMessageHandlerResponse;
  data: Record<string, unknown>;
}
