import type { JSONSchemaType } from 'ajv';

import { ROOM_ID_LENGTH } from '../../../utils/room-helpers';

export interface StartGameReq {
  roomId: string;
}

export const START_GAME_SCHEMA_NAME = 'StartGameReq';

const startGameReqSchema: JSONSchemaType<StartGameReq> = {
  type: 'object',
  properties: {
    roomId: { type: 'string', minLength: ROOM_ID_LENGTH, maxLength: ROOM_ID_LENGTH },
  },
  required: ['roomId'],
  additionalProperties: false,
};

export default startGameReqSchema;
