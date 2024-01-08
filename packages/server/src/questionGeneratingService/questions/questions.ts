import type { AnsweredQuestion } from '../types/question-types';
import type { QuestionData } from '../types/question-types';
import { findIndicesOfLargestElements } from '../utils/helper-functions';
import * as questionConsts from './question-consts';

export function mainstreamJunkie(data: QuestionData[]): AnsweredQuestion {
  const title = questionConsts.mainstreamJunkie.QUESTION_NAME;
  const description = questionConsts.mainstreamJunkie.QUESTION_DESCRIPTION;
  const answerType = questionConsts.mainstreamJunkie.ANSWER_TYPE;
  const answerOpts = data.map(questionData => questionData.player);

  //compare each player's most recently listened to track
  let mostPopular = -1;
  let players: string[] = [];

  for (let i = 0; i < answerOpts.length; i++) {
    const recentTracks = data[i].spotifyData.get_recently_played_tracks;

    if (recentTracks && recentTracks.items.length > 0) {
      const popularity = recentTracks.items[0].track.popularity;
      if (popularity > mostPopular) {
        players = [answerOpts[i]]; //clear array, replace w this player
        mostPopular = popularity;
      } else if (popularity == mostPopular) {
        players.push(answerOpts[i]); //multiple players now mostPopular
      }
    }
  }

  const correctAnswer = players;

  // TODO: Refactor const name, title name, questionDescription and questionDescriptionExtra. Confusing names. Create a model to avoid duplicate code.
  const answeredQuestion = {
    questionTitle: title,
    questionDescription: description,
    answerOptions: answerOpts,
    answerType: answerType,
    correctAnswer: correctAnswer,
  };

  return answeredQuestion;
}

export function hiddenGemHunter(data: QuestionData[]): AnsweredQuestion {
  const title = questionConsts.hiddenGemHunter.QUESTION_NAME;
  const description = questionConsts.hiddenGemHunter.QUESTION_DESCRIPTION;
  const answerType = questionConsts.hiddenGemHunter.ANSWER_TYPE;
  const answerOpts = data.map(questionData => questionData.player);

  //compare each player's most recently listened to track
  let leastPopular = 101;
  let players: string[] = [];

  for (let i = 0; i < answerOpts.length; i++) {
    const recentTracks = data[i].spotifyData.get_recently_played_tracks;

    if (recentTracks && recentTracks.items.length > 0) {
      const popularity = recentTracks.items[0].track.popularity;
      if (popularity < leastPopular) {
        players = [answerOpts[i]]; //clear array, replace w this player
        leastPopular = popularity;
      } else if (popularity == leastPopular) {
        players.push(answerOpts[i]); //multiple players now leastPopular
      }
    }
  }

  const correctAnswer = players;

  const answeredQuestion = {
    questionTitle: title,
    questionDescription: description,
    answerOptions: answerOpts,
    answerType: answerType,
    correctAnswer: correctAnswer,
  };

  return answeredQuestion;
}

export function theArtistScout(data: QuestionData[]): AnsweredQuestion {
  const title = questionConsts.theArtistScout.QUESTION_NAME;
  const description = questionConsts.theArtistScout.QUESTION_DESCRIPTION;
  const answerType = questionConsts.theArtistScout.ANSWER_TYPE;
  const correctAnswer: string[] = [];
  const answerOpts = data.map(questionData => questionData.player);

  const randomIndex = Math.floor(Math.random() * data.length);
  const player = data[randomIndex].player;
  const artists = new Set<string>();
  const recentTracks = data[randomIndex].spotifyData.get_recently_played_tracks;

  if (recentTracks && recentTracks.items.length > 0) {
    for (let i = 0; i < recentTracks.items.length; i++) {
      artists.add(recentTracks.items[i].track.artists[0].name); //just getting name of first artist on track, ignoring mult artists on one song
    }
  }

  const extraDescr = Array.from(artists).slice(0, 3); //using at most 3 artists to display in the question

  correctAnswer.push(player);

  const answeredQuestion = {
    questionTitle: title,
    questionDescription: description,
    questionDescriptionExtra: extraDescr,
    answerOptions: answerOpts,
    answerType: answerType,
    correctAnswer: correctAnswer,
  };

  return answeredQuestion;
}

export function multifacetedMelophile(data: QuestionData[]): AnsweredQuestion {
  const title = questionConsts.multifacetedMelophile.QUESTION_NAME;
  const description = questionConsts.multifacetedMelophile.QUESTION_DESCRIPTION;
  const answerType = questionConsts.multifacetedMelophile.ANSWER_TYPE;
  const answerOpts = data.map(questionData => questionData.player);
  const correctAnswer: string[] = [];

  const randomIndex = Math.floor(Math.random() * data.length);
  const player = data[randomIndex].player;
  const artists: string[] = [];

  const recentTracks = data[randomIndex].spotifyData.get_recently_played_tracks;

  if (recentTracks && recentTracks.items.length > 0) {
    const loopCount = Math.min(10, recentTracks.items.length); //10 songs or less if haven't listened to that many recently
    for (let i = 0; i < loopCount; i++) {
      artists.push(recentTracks.items[i].track.artists[0].name); //just getting name of first artist on track, ignoring mult artists on one song
    }
  }

  const uniqueArtists = new Set(artists);

  const extraDescr = String(uniqueArtists.size);

  correctAnswer.push(player);

  const answeredQuestion = {
    questionTitle: title,
    questionDescription: description,
    questionDescriptionExtra: extraDescr,
    answerOptions: answerOpts,
    answerType: answerType,
    correctAnswer: correctAnswer,
  };

  return answeredQuestion;
}

export function theXRatedPlayer(data: QuestionData[]): AnsweredQuestion {
  const title = questionConsts.theXRatedPlayer.QUESTION_NAME;
  const description = questionConsts.theXRatedPlayer.QUESTION_DESCRIPTION;
  const answerType = questionConsts.theXRatedPlayer.ANSWER_TYPE;
  const answerOpts = data.map(questionData => questionData.player);
  const correctAnswer: string[] = [];

  const explicitCount = Array(data.length).fill(0);

  //for each player, loop through all songs and increment the explicit count
  for (let i = 0; i < answerOpts.length; i++) {
    const recentTracks = data[i].spotifyData.get_recently_played_tracks;
    for (let j = 0; j < recentTracks.items?.length; j++) {
      if (recentTracks.items[j].track.explicit) {
        explicitCount[i]++;
      }
    }
  }

  //all players w largest num of explicit songs gets pushed to the answer arr
  const answerIndeces = findIndicesOfLargestElements(explicitCount);
  for (let i = 0; i < answerIndeces.length; i++) {
    correctAnswer.push(answerOpts[answerIndeces[i]]);
  }

  const answeredQuestion = {
    questionTitle: title,
    questionDescription: description,
    answerOptions: answerOpts,
    answerType: answerType,
    correctAnswer: correctAnswer,
  };

  return answeredQuestion;
}

/*   --- TEMPLATE ---

function questionName(data: QuestionData[]): AnsweredQuestion {
        
    const title = questionConsts.;
    const description =  questionConsts.;
    const answerType = questionConsts.;
    const correctAnswer: string[] = [];

    //logic to set the extra description (IF NEEDED)
    const extraDescr = ""

    //logic to set the answer options
    const answerOpts = [""]

    //logic to set the correct answer
    correctAnswer = [""]


    //put all together
    const answeredQuestion = {
        questionTitle: title,
        questionDescription: description,
        questionDescriptionExtra: extraDescr, //DELETE IF NOT NEEDED
        answerOptions: answerOpts,
        answerType: answerType,
        correctAnswer: correctAnswer
    }

    return answeredQuestion;
}

*/

export const questionFunctions = [
  mainstreamJunkie,
  hiddenGemHunter,
  theArtistScout,
  multifacetedMelophile,
  theXRatedPlayer,
];
