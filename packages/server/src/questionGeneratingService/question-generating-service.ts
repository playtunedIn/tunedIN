import type { AnsweredQuestion, QuestionData } from './types/question-types';
import { questionFunctions } from './questions/questions';
import { usersSpotifyData } from '../testing/mocks/question-generating-service/users';

interface User {
  name: string;
  token: string;
}

function getSpotifyData(users: User[]): QuestionData[] {
  console.log(users); //just placeholder, since mocking function rn
  return usersSpotifyData;
}

function getUniqueRandNums(max: number, total: number): number[] {
  if (total > max) {
    total = max;
  }

  const uniqueNumbers = new Set<number>();

  while (uniqueNumbers.size < total) {
    const randomNum = Math.floor(Math.random() * max);
    uniqueNumbers.add(randomNum);
  }
  return Array.from(uniqueNumbers);
}

export function getGameQuestions(users: User[], numQuestions: number): AnsweredQuestion[] {
  const results = [];

  const questionData = getSpotifyData(users);

  // turn question function obj into an arry
  const questionFunctionsArr: ((data: QuestionData[]) => AnsweredQuestion)[] = Object.values(questionFunctions);

  const randNums = getUniqueRandNums(questionFunctionsArr.length, numQuestions);

  // for each random number, call the associated function in the array of question functions
  for (let i = 0; i < randNums.length; i++) {
    results.push(questionFunctionsArr[randNums[i]](questionData));
  }

  return results;
}
