export interface QuestionsState {
  questions: ReceivedQuestion[];
  questionIndex: number;
}

export interface ReceivedQuestion {
  expirationTimestamp: number;
  question: string;
  choices: string[];
  answers?: number[];
}
