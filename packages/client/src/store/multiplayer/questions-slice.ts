import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface QuestionsState {
  questions: string[];
}

const initialState: QuestionsState = {
  questions: [],
};

const questionsSlice = createSlice({
  name: 'questions',
  initialState,
  reducers: {
    updateQuestions: (state, action: PayloadAction<string[]>) => {
      state.questions = action.payload;
    },
  },
});

export default questionsSlice.reducer;
export const { updateQuestions } = questionsSlice.actions;
