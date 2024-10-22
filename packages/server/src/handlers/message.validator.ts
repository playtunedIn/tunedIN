import type { JSONSchemaType } from 'ajv';
import Ajv from 'ajv';
import ajvKeywords from 'ajv-keywords';

import { JOIN_ROOM_SCHEMA_NAME } from './room-handlers/join-room/join-room.validator';
import joinRoomReqSchema from './room-handlers/join-room/join-room.validator';
import startGameReqSchema, { START_GAME_SCHEMA_NAME } from './room-handlers/start-game/start-game.validator';
import answerQuestionReqSchema, {
  ANSWER_QUESTION_SCHEMA_NAME,
} from './game-handlers/question-handlers/answer-question/answer-question.validator';

type SchemaName = typeof JOIN_ROOM_SCHEMA_NAME | typeof START_GAME_SCHEMA_NAME | typeof ANSWER_QUESTION_SCHEMA_NAME;
type Schema = typeof joinRoomReqSchema | typeof startGameReqSchema | typeof answerQuestionReqSchema;

const validator = ajvKeywords(new Ajv());

const schemaMap: Record<SchemaName, Schema> = {
  [JOIN_ROOM_SCHEMA_NAME]: joinRoomReqSchema,
  [START_GAME_SCHEMA_NAME]: startGameReqSchema,
  [ANSWER_QUESTION_SCHEMA_NAME]: answerQuestionReqSchema,
};

export const isValidSchema = <T>(data: T, schemaName: SchemaName): boolean => {
  let validate = validator.getSchema<JSONSchemaType<T>>(schemaName);
  if (!validate) {
    validator.addSchema(schemaMap[schemaName], schemaName);
    validate = validator.getSchema<JSONSchemaType<T>>(schemaName);
  }

  // Could use type assertion but ajv does not directly export type: AnyValidateFunction
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return Boolean(validate!(data));
};
