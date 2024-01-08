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

export function playlistMastermind(data: QuestionData[]): AnsweredQuestion {
  const title = questionConsts.playlistMastermind.QUESTION_NAME;
  const description = questionConsts.playlistMastermind.QUESTION_DESCRIPTION;
  const answerType = questionConsts.playlistMastermind.ANSWER_TYPE;
  const answerOpts = data.map(questionData => questionData.player);
  const correctAnswer: string[] = [];

  let extraDescr = 'This user has no playlists';

  //pick a random player
  const randomIndex = Math.floor(Math.random() * data.length);
  const player = data[randomIndex].player;

  //making sure user actually has a playlist, then picking a random one
  if (data[randomIndex].spotifyData.get_current_users_playlist.items?.length > 0) {
    const randPlaylistIndex = Math.floor(
      Math.random() * data[randomIndex].spotifyData.get_current_users_playlist.items.length
    );
    const randPlayerPlaylists = data[randomIndex].spotifyData.get_current_users_playlist.items[randPlaylistIndex].name;

    extraDescr = randPlayerPlaylists;
  }

  correctAnswer.push(player);

  //put all together
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

//export const albumArtAficionado = {
//   QUESTION_NAME: 'Album Art Aficionado',
//   QUESTION_DESCRIPTION: 'Who made a playlist and chose this as the album conver?',
//   ANSWER_TYPE: 'player',
// };

// function albumArtAficionado(data: QuestionData[]): AnsweredQuestion {

//   const title = questionConsts.albumArtAficionado.QUESTION_NAME;
//   const description =  questionConsts.albumArtAficionado.QUESTION_DESCRIPTION;
//   const answerType = questionConsts.albumArtAficionado.ANSWER_TYPE;
//   const correctAnswer: string[] = [];

//   //logic to set the extra description (IF NEEDED)
//   const extraDescr = ""

//   //logic to set the answer options
//   const answerOpts = [""]

//   //logic to set the correct answer
//   correctAnswer = [""]

//   //put all together
//   const answeredQuestion = {
//       questionTitle: title,
//       questionDescription: description,
//       questionDescriptionExtra: extraDescr, //DELETE IF NOT NEEDED
//       answerOptions: answerOpts,
//       answerType: answerType,
//       correctAnswer: correctAnswer
//   }

//   return answeredQuestion;
// }

export function theMostPopular(data: QuestionData[]): AnsweredQuestion {
  const title = questionConsts.theMostPopular.QUESTION_NAME;
  const description = questionConsts.theMostPopular.QUESTION_DESCRIPTION;
  const answerType = questionConsts.theMostPopular.ANSWER_TYPE;
  const answerOpts = data.map(questionData => questionData.player);

  //compare each player's # of followers
  let mostFollowers = -1;
  let players: string[] = [];

  for (let i = 0; i < answerOpts.length; i++) {
    const numFollowers = data[i].spotifyData.get_current_users_profile.followers.total;

    if (numFollowers > mostFollowers) {
      players = [answerOpts[i]]; //clear array, replace w this player
      mostFollowers = numFollowers;
    } else if (numFollowers == mostFollowers) {
      players.push(answerOpts[i]); //multiple players now mostPopular
    }
  }

  //logic to set the correct answer
  const correctAnswer = players;

  //put all together
  const answeredQuestion = {
    questionTitle: title,
    questionDescription: description,
    answerOptions: answerOpts,
    answerType: answerType,
    correctAnswer: correctAnswer,
  };

  return answeredQuestion;
}

export function albumCrusader(data: QuestionData[]): AnsweredQuestion {
  const title = questionConsts.albumCrusader.QUESTION_NAME;
  const description = questionConsts.albumCrusader.QUESTION_DESCRIPTION;
  const answerType = questionConsts.albumCrusader.ANSWER_TYPE;
  const answerOpts = data.map(questionData => questionData.player);
  const correctAnswer: string[] = [];

  let extraDescr = 'This player has not listened to a song recently';

  //grab a players song and pick album
  const randomIndex = Math.floor(Math.random() * data.length);
  const player = data[randomIndex].player;
  const recentTracks = data[randomIndex].spotifyData.get_recently_played_tracks;

  if (recentTracks && recentTracks.items.length > 0) {
    //pick a random track & grab the album
    const randomSongIndex = Math.floor(Math.random() * recentTracks.items.length);
    const album = recentTracks.items[randomSongIndex].track.album.name;
    extraDescr = album;
  }

  //logic to set the correct answer
  correctAnswer.push(player);

  //put all together
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

export function pennyPinchingPlayer(data: QuestionData[]): AnsweredQuestion {
  const title = questionConsts.pennyPinchingPlayer.QUESTION_NAME;
  const description = questionConsts.pennyPinchingPlayer.QUESTION_DESCRIPTION;
  const answerType = questionConsts.pennyPinchingPlayer.ANSWER_TYPE;
  const correctAnswer: string[] = [];

  const answerOpts = data.map(questionData => questionData.player);
  answerOpts.push('Nobody!');

  //grab players with free version
  for (let i = 0; i < data.length; i++) {
    if (
      data[i].spotifyData.get_current_users_profile.product === 'free' ||
      data[i].spotifyData.get_current_users_profile.product === 'open'
    ) {
      correctAnswer.push(data[i].player);
    }
  }

  if (correctAnswer.length == 0) {
    correctAnswer.push('Nobody!');
  }

  //put all together
  const answeredQuestion = {
    questionTitle: title,
    questionDescription: description,
    answerOptions: answerOpts,
    answerType: answerType,
    correctAnswer: correctAnswer,
  };

  return answeredQuestion;
}

// function popularityMagnet(data: QuestionData[]): AnsweredQuestion {
//   const title = questionConsts.popularityMagnet.QUESTION_NAME;
//   const description = questionConsts.popularityMagnet.QUESTION_DESCRIPTION;
//   const answerType = questionConsts.popularityMagnet.ANSWER_TYPE;
//   const answerOpts = data.map(questionData => questionData.player);
//   let correctAnswer: string[] = [];

//   //compare each player's most recently listened to artist
//   let mostPopular = -1;

//   for (let i = 0; i < answerOpts.length; i++) {
//     const recentTracks = data[i].spotifyData.get_recently_played_tracks;

//     if (recentTracks && recentTracks.items.length > 0) {
//       const popularity = recentTracks.items[0].track.artists[0].popularity;
//       if (popularity > mostPopular) {
//         correctAnswer = [answerOpts[i]]; //clear array, replace w this player
//         mostPopular = popularity;
//       } else if (popularity == mostPopular) {
//         correctAnswer.push(answerOpts[i]); //multiple players now mostPopular
//       }
//     }
//   }

//   //put all together
//   const answeredQuestion = {
//     questionTitle: title,
//     questionDescription: description,
//     answerOptions: answerOpts,
//     answerType: answerType,
//     correctAnswer: correctAnswer,
//   };

//   return answeredQuestion;
// }

export function collaborationConnoisseur(data: QuestionData[]): AnsweredQuestion {
  const title = questionConsts.collaborationConnoisseur.QUESTION_NAME;
  const description = questionConsts.collaborationConnoisseur.QUESTION_DESCRIPTION;
  const answerType = questionConsts.collaborationConnoisseur.ANSWER_TYPE;
  const answerOpts = data.map(questionData => questionData.player);
  answerOpts.push('No player recently listened to songs ft. more than one artist');
  const correctAnswer: string[] = [];

  //loop through all players, get recent 3 tracks, if at least one of the songs has more than 1 artist, add to answer array
  for (let i = 0; i < answerOpts.length - 1; i++) {
    const recentTracks = data[i].spotifyData.get_recently_played_tracks;

    if (recentTracks && recentTracks.items.length > 2) {
      for (let j = 0; j < 3; j++) {
        if (data[i].spotifyData.get_recently_played_tracks.items[j].track.artists.length > 1) {
          correctAnswer.push(data[i].player);
          break;
        }
      }
    }
  }

  if (correctAnswer.length === 0) {
    correctAnswer.push('No player recently listened to songs ft. more than one artist');
  }

  //put all together
  const answeredQuestion = {
    questionTitle: title,
    questionDescription: description,
    answerOptions: answerOpts,
    answerType: answerType,
    correctAnswer: correctAnswer,
  };

  return answeredQuestion;
}

export function songSpy(data: QuestionData[]): AnsweredQuestion {
  const title = questionConsts.songSpy.QUESTION_NAME;
  const description = questionConsts.songSpy.QUESTION_DESCRIPTION;
  const answerType = questionConsts.songSpy.ANSWER_TYPE;
  const answerOpts = data.map(questionData => questionData.player);
  const correctAnswer: string[] = [];

  let extraDescr = 'This user has not listened to a song recently';

  //pick a random player
  const randomIndex = Math.floor(Math.random() * data.length);
  const player = data[randomIndex].player;

  //making sure user actually has a recent song, then picking a random one
  if (data[randomIndex].spotifyData.get_recently_played_tracks.items?.length > 0) {
    const randomSongIndex = Math.floor(
      Math.random() * data[randomIndex].spotifyData.get_recently_played_tracks.items.length
    );
    const randPlayerSong = data[randomIndex].spotifyData.get_recently_played_tracks.items[randomSongIndex].track.name;

    extraDescr = randPlayerSong;
  }

  correctAnswer.push(player);

  //put all together
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

export function artistOnMyMind(data: QuestionData[]): AnsweredQuestion {
  const title = questionConsts.artistOnMyMind.QUESTION_NAME;
  const description = questionConsts.artistOnMyMind.QUESTION_DESCRIPTION;
  const answerType = questionConsts.artistOnMyMind.ANSWER_TYPE;
  const answerOpts = data.map(questionData => questionData.player);
  const correctAnswer: string[] = [];

  let extraDescr = 'This user has not listened to a song recently';

  //pick a random player
  const randomIndex = Math.floor(Math.random() * data.length);
  const player = data[randomIndex].player;

  //making sure user actually has a recent song, then picking a random one
  if (data[randomIndex].spotifyData.get_recently_played_tracks.items?.length > 0) {
    const randomSongIndex = Math.floor(
      Math.random() * data[randomIndex].spotifyData.get_recently_played_tracks.items.length
    );
    const randPlayerSongArtist =
      data[randomIndex].spotifyData.get_recently_played_tracks.items[randomSongIndex].track.artists[0].name; //only taking first artist (even if collab)

    extraDescr = randPlayerSongArtist;
  }

  correctAnswer.push(player);

  //put all together
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

export function albumCollector(data: QuestionData[]): AnsweredQuestion {
  const title = questionConsts.albumCollector.QUESTION_NAME;
  const description = questionConsts.albumCollector.QUESTION_DESCRIPTION;
  const answerType = questionConsts.albumCollector.ANSWER_TYPE;
  const answerOpts = data.map(questionData => questionData.player);
  const correctAnswer: string[] = [];
  const extraDescr = new Set<string>();

  //pick a random player
  const randomIndex = Math.floor(Math.random() * data.length);
  correctAnswer.push(data[randomIndex].player);

  //loop through all players, get recent 3 tracks, push unique albums to extra description
  const recentTracks = data[randomIndex].spotifyData.get_recently_played_tracks;
  if (recentTracks && recentTracks.items.length > 2) {
    for (let j = 0; j < 3; j++) {
      extraDescr.add(recentTracks.items[j].track.album.name);
    }
  }

  if (extraDescr.size === 0) {
    extraDescr.add('This player has not listened to enough songs recently (less than 3)');
  }

  //put all together
  const answeredQuestion = {
    questionTitle: title,
    questionDescription: description,
    questionDescriptionExtra: Array.from(extraDescr),
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
  theArtistScout,
  multifacetedMelophile,
  theXRatedPlayer,
  playlistMastermind,
  playlistMastermind,
  //albumArtAficionado,
  theMostPopular,
  albumCrusader,
  albumCrusader,
  pennyPinchingPlayer,
  //popularityMagnet,
  collaborationConnoisseur,
  songSpy,
  songSpy,
  songSpy,
  artistOnMyMind,
  artistOnMyMind,
  albumCollector,
];
