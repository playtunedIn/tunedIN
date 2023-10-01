import type { SpotifyData } from '../types/spotify-responses';

export interface QuestionData {
  player: string;
  spotify_data: SpotifyData;
}

export interface AnsweredQuestion {
  question_title: string;
  question_description: string;
  question_description_extra?: string | string[];
  answer_options: string[];
  answer_type: string;
  correct_answer: string[];
}
