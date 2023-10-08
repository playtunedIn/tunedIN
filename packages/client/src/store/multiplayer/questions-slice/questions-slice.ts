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
    addQuestion: (state, action: PayloadAction<ReceivedQuestion>) => {
      state.questions.push(action.payload);
    },
    updateQuestionsState: (_, action: PayloadAction<QuestionsState>) => {
      return action.payload;
    },
  },
});

export default questionsSlice.reducer;
export const { addQuestion, updateQuestionsState } = questionsSlice.actions;
