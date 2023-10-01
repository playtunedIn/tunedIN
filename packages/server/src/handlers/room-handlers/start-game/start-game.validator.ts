import type { JSONSchemaType } from 'ajv';

export interface StartGameReq {
  roomId: string;
}

export const START_GAME_SCHEMA_NAME = 'StartGameReq';

const startGameReqSchema: JSONSchemaType<StartGameReq> = {
  type: 'object',
  properties: {
    roomId: { type: 'string' },
  },
  required: ['roomId'],
  additionalProperties: false,
};

export default startGameReqSchema;
