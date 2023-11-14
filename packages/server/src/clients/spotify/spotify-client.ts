import type { Question } from '../redis/models/game-state';
import type { User } from '../../questionGeneratingService/types/question-types';

type Image = {
  url: string;
};

type Profile = {
  display_name: string;
  external_urls: Record<string, string>;
  href: string;
  id: string;
  images: Image[];
  type: string;
  uri: string;
  country: string;
  product: string;
  explicit_content: { filter_enabled: boolean; filter_locked: boolean };
  email: string;
};

export const getSelf = async (token: string): Promise<Profile> => {
  // use the access token to access the Spotify Web API
  const options = {
    method: 'GET',
    headers: { Authorization: 'Bearer ' + token },
    json: true,
  };
  const accessResponse = await fetch('https://api.spotify.com/v1/me', options);
  const profileBody = (await accessResponse.json()) as Profile;
  return profileBody;
};

export async function fetchUserProfile(user: User) {
  console.log('JAMIE inside fetch user profile');
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

export async function fetchUserPlaylists(user: User) {
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

export async function fetchRecentlyPlayedTracks(user: User) {
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

//leaving this in for reference in connection tickets FYI, will remove then
// TODO: create actual implementation for getting questions from Spotify
export const getQuestions = async (): Promise<Question[]> => {
  return [];
};
