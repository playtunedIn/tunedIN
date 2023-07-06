import Ajv from 'ajv';

import createRoomReqSchema, { CREATE_ROOM_SCHEMA_NAME } from './create-room/create-room.validator';
import joinRoomReqSchema, { JOIN_ROOM_SCHEMA_NAME } from './join-room/join-room.validator';

const validator = new Ajv();

export const validatorInit = () => {
  validator.addSchema(createRoomReqSchema, CREATE_ROOM_SCHEMA_NAME);
  validator.addSchema(joinRoomReqSchema, JOIN_ROOM_SCHEMA_NAME);
};

export default validator;
