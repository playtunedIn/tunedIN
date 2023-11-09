import type { AnsweredQuestion, QuestionData } from './types/question-types';
import { questionFunctions } from './questions/questions';

interface User {
  name: string;
  token: string;
}

async function fetchUserProfile(user: User) {
  const options = {
    method: 'GET',
    headers: { Authorization: 'Bearer ' + user.token },
    json: true,
  };
  const response = await fetch('https://api.spotify.com/v1/me', options);

  if (response.ok) {
    return await response.json();
  } else {
    throw new Error(`Request USER PROFILE failed with status: ${response.status}`);
  }
}

async function fetchUserPlaylists(user: User) {
  const options = {
    method: 'GET',
    headers: { Authorization: 'Bearer ' + user.token },
    json: true,
  };
  const response = await fetch('https://api.spotify.com/v1/me/playlists', options);

  if (response.ok) {
    return await response.json();
  } else {
    throw new Error(`Request USER PLAYLIST failed with status: ${response.status}`);
  }
}

async function fetchRecentlyPlayedTracks(user: User) {
  const options = {
    method: 'GET',
    headers: { Authorization: 'Bearer ' + user.token },
    json: true,
  };
  const response = await fetch('https://api.spotify.com/v1/me/player/recently-played', options);

  if (response.ok) {
    return await response.json();
  } else {
    throw new Error(`Request RECENTLY PLAYED failed with status: ${response.status}`);
  }
}

export async function getSpotifyData(users: User[]): Promise<QuestionData[]> {
  const resultingData = [];

  for (let i = 0; i < users.length; i++) {
    try {
      const profileData = await fetchUserProfile(users[i]);
      const playlistData = await fetchUserPlaylists(users[i]);
      const trackData = await fetchRecentlyPlayedTracks(users[i]);

      resultingData.push({
        player: users[i].name,
        spotifyData: {
          get_current_users_profile: profileData,
          get_current_users_playlist: playlistData,
          get_recently_played_tracks: trackData,
        },
      });
    } catch (error) {
      throw new Error('An error occurred while getting spotify data: ' + error);
    }
  }

  return resultingData;
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

export async function getGameQuestions(users: User[], numQuestions: number): Promise<AnsweredQuestion[]> {
  const results = [];

  try {
    const questionData = await getSpotifyData(users);

    const randNums = getUniqueRandNums(questionFunctions.length, numQuestions);

    for (let i = 0; i < randNums.length; i++) {
      results.push(questionFunctions[randNums[i]](questionData));
    }

    return results;
  } catch (error) {
    throw new Error('An error occurred while getting game questions: ' + error);
  }
}
