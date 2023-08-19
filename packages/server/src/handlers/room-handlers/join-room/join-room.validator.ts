import type { JSONSchemaType } from 'ajv';

export interface JoinRoomReq {
  roomId: string;
}

export const JOIN_ROOM_SCHEMA_NAME = 'JoinRoomReq';

const joinRoomReqSchema: JSONSchemaType<JoinRoomReq> = {
  type: 'object',
  properties: {
    roomId: { type: 'string' },
  },
  required: ['roomId'],
  additionalProperties: false,
};

export default joinRoomReqSchema;
