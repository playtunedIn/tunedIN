import type { JSONSchemaType } from 'ajv';

export interface AnswerQuestionReq {
  roomId: string;
  questionIndex: number;
  answerIndex: number;
}

export const ANSWER_QUESTION_SCHEMA_NAME = 'AnswerQuestionReq';

const answerQuestionReqSchema: JSONSchemaType<AnswerQuestionReq> = {
  type: 'object',
  properties: {
    roomId: { type: 'string' },
    questionIndex: { type: 'number' },
    answerIndex: { type: 'number' },
  },
  required: ['roomId', 'questionIndex', 'answerIndex'],
  additionalProperties: false,
};

export default answerQuestionReqSchema;
