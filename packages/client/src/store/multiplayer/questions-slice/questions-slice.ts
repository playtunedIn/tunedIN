import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import type { QuestionsState, ReceivedQuestion } from '@store/multiplayer/questions-slice/questions-slice.types';

const initialState: QuestionsState = {
  questions: [],
  questionIndex: 0,
};

const questionsSlice = createSlice({
  name: 'questions',
  initialState,
  reducers: {
    addQuestion: (state, action: PayloadAction<{ question: ReceivedQuestion; questionIndex: number }>) => {
      const { question, questionIndex } = action.payload;
      state.questions[questionIndex] = question;
    },
    updateQuestionAnswers: (state, action: PayloadAction<{ answers: number[]; questionIndex: number }>) => {
      const { questionIndex, answers } = action.payload;

      state.questions[questionIndex].answers = answers;
    },
    updateQuestionsState: (_, action: PayloadAction<QuestionsState>) => {
      return action.payload;
    },
  },
});

export default questionsSlice.reducer;
export const { addQuestion, updateQuestionsState, updateQuestionAnswers } = questionsSlice.actions;
