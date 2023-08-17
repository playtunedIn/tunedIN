import { JSONSchemaType } from 'ajv';

export interface CreateRoomReq {
  playerId: string;
}

export const CREATE_ROOM_SCHEMA_NAME = 'CreateRoomReq';

const createRoomReqSchema: JSONSchemaType<CreateRoomReq> = {
  type: 'object',
  properties: {
    playerId: { type: 'string' },
  },
  required: ['playerId'],
  additionalProperties: false,
};

export default createRoomReqSchema;
