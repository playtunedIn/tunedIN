import type { JSONSchemaType } from 'ajv';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CreateRoomReq {}

export const CREATE_ROOM_SCHEMA_NAME = 'CreateRoomReq';

const createRoomReqSchema: JSONSchemaType<CreateRoomReq> = {
  type: 'object',
  additionalProperties: false,
};

export default createRoomReqSchema;
