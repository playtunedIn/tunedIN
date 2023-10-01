import type { AnsweredQuestion, QuestionData } from './types/question-types';
import { questionFunctions } from './questions/questions';
import { jamieProfileData, shayneProfileData } from './mock/spotify-api/get-current-users-profile';
import { jamiePlaylistData, shaynePlaylistData } from './mock/spotify-api/get-current-users-playlist';
import { jamieTrackData, shayneTrackData } from './mock/spotify-api/get-recently-played-tracks';

interface User {
  name: string;
  token: string;
}

function getSpotifyData(users: User[]): QuestionData[] {
  const theUsers = users;
  console.log(theUsers);
  //hardcoding for now to be the mock data
  const resultJamie: QuestionData = {
    player: 'jamie',
    spotify_data: {
      get_current_users_profile: jamieProfileData,
      get_current_users_playlist: jamiePlaylistData,
      get_recently_played_tracks: jamieTrackData,
    },
  };
  const resultShayne: QuestionData = {
    player: 'shayne',
    spotify_data: {
      get_current_users_profile: shayneProfileData,
      get_current_users_playlist: shaynePlaylistData,
      get_recently_played_tracks: shayneTrackData,
    },
  };

  return [resultJamie, resultShayne];
}

function getRandomNumbers(max: number, total: number): number[] {
  if (total > max) {
    throw new Error('Total cannot be greater than max'); //LOOK at how shayne does errors
  }

  const numbers: number[] = [];

  // Fill the array with numbers from 0 to max (exclusive)
  for (let i = 0; i < max; i++) {
    numbers.push(i);
  }

  // Shuffle the array using Fisher-Yates algorithm
  for (let i = max - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  // Take the first 'total' numbers
  return numbers.slice(0, total);
}

export function getGameQuestions(users: User[], numQuestions: number): AnsweredQuestion[] {
  const results = [];

  // get the spotify data for each player
  const questionData = getSpotifyData(users);

  // turn question function obj into an arry
  const questionFunctionsArr: ((data: QuestionData[]) => AnsweredQuestion)[] = Object.values(questionFunctions);

  console.log('JAMIE the question functions array is: ', questionFunctionsArr);

  // get random numbers
  const randNums = getRandomNumbers(questionFunctionsArr.length, numQuestions);

  // for each random number, call the associated function in the array of question functions
  for (let i = 0; i < randNums.length; i++) {
    results.push(questionFunctionsArr[randNums[i]](questionData));
  }

  return results;
}

/*

1) create a json object like this:
    {
        favSong: (big data) => {},
        topArtist: (big data) => {},
        etc.
    }

    so basically, an json object filled with the functions for each question. They take in the same parameters (because it's typed)
    so it needs to be same type, then it will return the question answer thing


2) const questionSelector = Object.keys(theJsonObjAbove) // turns it into an array
3) a function that makes an array of unique random numbers, passing in two things (the size of the questions array, and the num round questions)
4) call the function at each index of the array 

**** for now, a question can only get called once in a game, even though a question might have randomization within it, making it potentially unique
    - later on, we can add a tag indicating if something can be called twice in a game? idk
*/

//ASSUMPTIONS/DECISIONS:
/*

    - the questions will list ALL player names as question options when applicable
    - a question will only be called once in a game 
    - player needs a unique nickname/username to enter the game

 */
