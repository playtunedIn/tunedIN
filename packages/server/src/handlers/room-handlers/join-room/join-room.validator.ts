import type { JSONSchemaType } from 'ajv';

import { ROOM_ID_LENGTH } from '../../../utils/room-helpers';

export interface JoinRoomReq {
  roomId: string;
  name: string;
}

export const JOIN_ROOM_SCHEMA_NAME = 'JoinRoomReq';
export const MIN_NAME_LENGTH = 1;
export const MAX_NAME_LENGTH = 15;

const joinRoomReqSchema: JSONSchemaType<JoinRoomReq> = {
  type: 'object',
  properties: {
    roomId: { type: 'string', minLength: ROOM_ID_LENGTH, maxLength: ROOM_ID_LENGTH },
    name: { type: 'string', minLength: MIN_NAME_LENGTH, maxLength: MAX_NAME_LENGTH, transform: ['trim'] },
  },
  required: ['roomId', 'name'],
  additionalProperties: false,
};

export default joinRoomReqSchema;
