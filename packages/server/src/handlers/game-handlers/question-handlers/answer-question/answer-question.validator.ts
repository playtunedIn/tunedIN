import type { JSONSchemaType } from 'ajv';

export interface AnswerQuestionReq {
  roomId: string;
  questionIndex: number;
  answerIndexes: number[];
}

export const ANSWER_QUESTION_SCHEMA_NAME = 'AnswerQuestionReq';

const answerQuestionReqSchema: JSONSchemaType<AnswerQuestionReq> = {
  type: 'object',
  properties: {
    roomId: { type: 'string' },
    questionIndex: { type: 'number' },
    answerIndexes: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
  },
  required: ['roomId', 'questionIndex', 'answerIndexes'],
  additionalProperties: false,
};

export default answerQuestionReqSchema;
