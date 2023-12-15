import type { SpotifyData } from '../types/spotify-responses';

export interface QuestionData {
  player: string;
  spotifyData: SpotifyData;
}

export interface AnsweredQuestion {
  questionTitle: string;
  questionDescription: string;
  questionDescriptionExtra?: string | string[];
  answerOptions: string[];
  answerType: string;
  correctAnswer: string[];
}

export interface User {
  name: string;
  token: string;
}
