import type { AnsweredQuestion } from '../types/question-types';
import type { QuestionData } from '../types/question-types';
import { findIndicesOfLargestElements } from '../utils/helper-functions';

function mainstreamJunkie(data: QuestionData[]): AnsweredQuestion {
  const title = 'Mainstream Junkie';
  const description = 'Who listened to the most popular song most recently?';
  const answerType = 'player';

  //players are the answer options
  const answerOpts = data.map(questionData => questionData.player);

  //compare each player's most recently listened to track
  let mostPopular = -1;
  let players = [''];

  for (let i = 0; i < answerOpts.length; i++) {
    const recentTracks = data[i].spotify_data.get_recently_played_tracks;

    if (recentTracks && recentTracks.items.length > 0) {
      //in case someone hasn't listened to a song ever
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

  const answeredQuestion = {
    question_title: title,
    question_description: description,
    answer_options: answerOpts,
    answer_type: answerType,
    correct_answer: correctAnswer,
  };

  return answeredQuestion;
}

function hiddenGemHunter(data: QuestionData[]): AnsweredQuestion {
  const title = 'Hidden Gem Hunter';
  const description = 'Who listened to the least popular song most recently?';
  const answerType = 'player';

  //players are the answer options
  const answerOpts = data.map(questionData => questionData.player);

  //compare each player's most recently listened to track
  let leastPopular = 101;
  let players = [''];

  for (let i = 0; i < answerOpts.length; i++) {
    const recentTracks = data[i].spotify_data.get_recently_played_tracks;

    if (recentTracks && recentTracks.items.length > 0) {
      //in case someone hasn't listened to a song ever
      const popularity = recentTracks.items[0].track.popularity;
      if (popularity < leastPopular) {
        players = [answerOpts[i]]; //clear array, replace w this player
        leastPopular = popularity;
      } else if (popularity == leastPopular) {
        players.push(answerOpts[i]); //multiple players now mostPopular
      }
    }
  }

  const correctAnswer = players;

  //put all together
  const answeredQuestion = {
    question_title: title,
    question_description: description,
    answer_options: answerOpts,
    answer_type: answerType,
    correct_answer: correctAnswer,
  };

  return answeredQuestion;
}

function theArtistScout(data: QuestionData[]): AnsweredQuestion {
  const title = 'The Artist Scout';
  const description = 'Who listened to this list of artists recently?';
  const answerType = 'player';
  const correctAnswer: string[] = [];

  //players are the answer options
  const answerOpts = data.map(questionData => questionData.player);

  //pick a player, and grab a list of up to 3 artists recently listend to
  const randomIndex = Math.floor(Math.random() * data.length);
  const player = data[randomIndex].player;
  const artists = [];

  // loop through most recent songs, grap the artist
  const recentTracks = data[randomIndex].spotify_data.get_recently_played_tracks;

  if (recentTracks && recentTracks.items.length > 0) {
    //in case someone hasn't listened to a song ever
    for (let i = 0; i < recentTracks.items.length; i++) {
      artists.push(recentTracks.items[i].track.artists[0].name); //just getting name of first artist on track, ignoring mult artists on one song
    }
  }

  const extraDescr = artists.slice(0, 3); //using at most 3 artists to display in the question

  correctAnswer.push(player);

  //put all together
  const answeredQuestion = {
    question_title: title,
    question_description: description,
    question_description_extra: extraDescr, //DELETE IF NOT NEEDED
    answer_options: answerOpts,
    answer_type: answerType,
    correct_answer: correctAnswer,
  };

  return answeredQuestion;
}

function multifacetedMelophile(data: QuestionData[]): AnsweredQuestion {
  const title = 'Multifaceted Melophile';
  const description = "Who's 10 most recent songs were sung by this number of unique artists";
  const answerType = 'player';
  //players are the answer options
  const answerOpts = data.map(questionData => questionData.player);
  const correctAnswer: string[] = [];

  //pick a player, and grab a list of up to artists recently listend to
  const randomIndex = Math.floor(Math.random() * data.length);
  const player = data[randomIndex].player;
  const artists = [];

  // loop through most recent songs, grap the artist
  const recentTracks = data[randomIndex].spotify_data.get_recently_played_tracks;

  if (recentTracks && recentTracks.items.length > 0) {
    //in case someone hasn't listened to a song ever
    const loopCount = Math.min(10, recentTracks.items.length); //10 songs or less if haven't listened to that many recently
    for (let i = 0; i < loopCount; i++) {
      artists.push(recentTracks.items[i].track.artists[0].name); //just getting name of first artist on track, ignoring mult artists on one song
    }
  }

  console.log('JAMIE the artists are: ', artists);
  const uniqueArtists = new Set(artists);
  console.log('JAMIE the unique artists are: ', uniqueArtists);

  //logic to set the extra description (IF NEEDED)
  const extraDescr = String(uniqueArtists.size);

  correctAnswer.push(player);

  //put all together
  const answeredQuestion = {
    question_title: title,
    question_description: description,
    question_description_extra: extraDescr, //DELETE IF NOT NEEDED
    answer_options: answerOpts,
    answer_type: answerType,
    correct_answer: correctAnswer,
  };

  return answeredQuestion;
}

function theXRatedPlayer(data: QuestionData[]): AnsweredQuestion {
  const title = 'The X-Rated Player';
  const description = 'Who listened to the most explicit songs recently?';
  const answerType = 'player';
  //players are the answer options
  const answerOpts = data.map(questionData => questionData.player);
  const correctAnswer: string[] = [];

  //initialize explicit count to 0 for all players
  const explicitCount = Array(data.length).fill(0);

  //for each player, loop through all songs and increment the explicit count
  for (let i = 0; i < answerOpts.length; i++) {
    const recentTracks = data[i].spotify_data.get_recently_played_tracks;
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

  console.log('jamie the array of explicit counts is: ', explicitCount);

  //put all together
  const answeredQuestion = {
    question_title: title,
    question_description: description,
    answer_options: answerOpts,
    answer_type: answerType,
    correct_answer: correctAnswer,
  };

  return answeredQuestion;
}

/*   --- TEMPLATE ---

function questionName(data: QuestionData[]): AnsweredQuestion {
        
    const title = "";
    const description =  "";
    const answerType = "";
    let correctAnswer = [];

    //logic to set the extra description (IF NEEDED)
    const extraDescr = ""

    //logic to set the answer options
    const answerOpts = [""]

    //logic to set the correct answer
    correctAnswer = [""]


    //put all together
    const answeredQuestion = {
        question_title: title,
        question_description: description,
        question_description_extra: extraDescr, //DELETE IF NOT NEEDED
        answer_options: answerOpts,
        answer_type: answerType,
        correct_answer: correctAnswer
    }

    return answeredQuestion;
}

*/

export const questionFunctions = {
  mainstream_junkie: mainstreamJunkie,
  hidden_gem_hunter: hiddenGemHunter,
  the_artist_scout: theArtistScout,
  multifaceted_melophile: multifacetedMelophile,
  the_x_rated_player: theXRatedPlayer,
};
