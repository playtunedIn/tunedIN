import { jamieProfileData, shayneProfileData } from './spotify-api/get-current-users-profile';
import { jamiePlaylistData, shaynePlaylistData } from './spotify-api/get-current-users-playlist';
import { jamieTrackData, shayneTrackData } from './spotify-api/get-recently-played-tracks';
import type { QuestionData } from '../../../questionGeneratingService/types/question-types';

export const usersSpotifyData = [
  {
    player: 'jamie',
    spotifyData: {
      get_current_users_profile: jamieProfileData,
      get_current_users_playlist: jamiePlaylistData,
      get_recently_played_tracks: jamieTrackData,
    },
  },
  {
    player: 'shayne',
    spotifyData: {
      get_current_users_profile: shayneProfileData,
      get_current_users_playlist: shaynePlaylistData,
      get_recently_played_tracks: shayneTrackData,
    },
  },
];

export function getSpotifyData(): QuestionData[] {
  return structuredClone(usersSpotifyData); //for deep cloning when object is modified in tests
}

export const users = [
  {
    name: 'jamie',
    token: '123',
  },
  {
    name: 'shayne',
    token: '456',
  },
];
