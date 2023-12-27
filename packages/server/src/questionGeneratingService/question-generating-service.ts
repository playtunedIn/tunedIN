import type { AnsweredQuestion, QuestionData, User } from './types/question-types';
import { questionFunctions } from './questions/questions';
//import { fetchUserPlaylists, fetchRecentlyPlayedTracks, fetchUserProfile } from '../clients/spotify/spotify-client';
import { usersSpotifyData } from '../testing/mocks/question-generating-service/users';

// export async function getSpotifyData(users: User[]): Promise<QuestionData[]> {
//   const resultingData = [];

//   for (let i = 0; i < users.length; i++) {
//     try {
//       const profileData = await fetchUserProfile(users[i]);
//       const playlistData = await fetchUserPlaylists(users[i]);
//       const trackData = await fetchRecentlyPlayedTracks(users[i]);

//       resultingData.push({
//         player: users[i].name,
//         spotifyData: {
//           get_current_users_profile: profileData,
//           get_current_users_playlist: playlistData,
//           get_recently_played_tracks: trackData,
//         },
//       });
//     } catch (error) {
//       throw new Error('An error occurred while getting spotify data: ' + error);
//     }
//   }

//   return resultingData;
// }

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

  try {
    const questionData = getSpotifyData(users);

    const randNums = getUniqueRandNums(questionFunctions.length, numQuestions);

    for (let i = 0; i < randNums.length; i++) {
      results.push(questionFunctions[randNums[i]](questionData));
    }

    return results;
  } catch (error) {
    throw new Error('An error occurred while getting game questions: ' + error);
  }
}
