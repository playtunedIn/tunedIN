import type { JSONSchemaType } from 'ajv';

export interface CreateRoomReq {
  roomId: string;
}

export const CREATE_ROOM_SCHEMA_NAME = 'CreateRoomReq';

const createRoomReqSchema: JSONSchemaType<CreateRoomReq> = {
  type: 'object',
  properties: {
    roomId: { type: 'string' },
  },
  required: ['roomId'],
  additionalProperties: false,
};

export default createRoomReqSchema;
