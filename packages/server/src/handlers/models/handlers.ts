import { recoverRoomSessionHandler } from '../room-handlers/recover-room-session/recover-room-session';
import { createRoomHandler } from '../room-handlers/create-room/create-room';
import { joinRoomHandler } from '../room-handlers/join-room/join-room';
import { leaveRoomHandler } from '../room-handlers/leave-room/leave-room';
import { unsubscribeRoomHandler } from '../subscribed-message-handlers';
import { startGameHandler } from '../room-handlers/start-game/start-game';
import { answerQuestionHandler } from '../game-handlers/question-handlers/answer-question/answer-question';

export interface SocketMessage {
  type: keyof typeof messageHandlers;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export interface SocketResponse {
  type: keyof typeof messageHandlers;
}

export const messageHandlers = {
  createRoom: createRoomHandler,
  joinRoom: joinRoomHandler,
  leaveRoom: leaveRoomHandler,
  startGame: startGameHandler,
  answerQuestion: answerQuestionHandler,
  unsubscribeRoom: unsubscribeRoomHandler,
  recoverRoomSession: recoverRoomSessionHandler,
};
