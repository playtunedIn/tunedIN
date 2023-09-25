import type { JSONSchemaType } from 'ajv';
import Ajv from 'ajv';

import { CREATE_ROOM_SCHEMA_NAME } from './room-handlers/create-room/create-room.validator';
import createRoomReqSchema from './room-handlers/create-room/create-room.validator';
import { JOIN_ROOM_SCHEMA_NAME } from './room-handlers/join-room/join-room.validator';
import joinRoomReqSchema from './room-handlers/join-room/join-room.validator';
import startGameReqSchema, { START_GAME_SCHEMA_NAME } from 'src/handlers/room-handlers/start-game/start-game.validator';

type SchemaName = typeof CREATE_ROOM_SCHEMA_NAME | typeof JOIN_ROOM_SCHEMA_NAME | typeof START_GAME_SCHEMA_NAME;
type Schema = typeof createRoomReqSchema | typeof joinRoomReqSchema | typeof startGameReqSchema;

const validator = new Ajv();

const schemaMap: Record<SchemaName, Schema> = {
  [CREATE_ROOM_SCHEMA_NAME]: createRoomReqSchema,
  [JOIN_ROOM_SCHEMA_NAME]: joinRoomReqSchema,
  [START_GAME_SCHEMA_NAME]: startGameReqSchema,
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
