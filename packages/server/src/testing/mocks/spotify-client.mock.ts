import type { Question } from 'src/clients/redis/models/game-state';

export const createMockQuestions = (): Question[] => [
  {
    question: "Which player's favorite artist is Taylor Swift?",
    choices: ['Emil', 'Matt', 'Jamie', 'Trevor'],
    answer: 0,
  },
  {
    question: 'Which decade was the hit band "Nirvana" most popular?',
    choices: ['1970', '1980', '1990', '2000'],
    answer: 2,
  },
  {
    question: "Which player has listened to the U.S.'s top 50 most popular songs most recently?",
    choices: ['Jamie', 'Haley', 'Emil', 'Shayne'],
    answer: 3,
  },
];

export const createMockQuestion = () => createMockQuestions()[0];
