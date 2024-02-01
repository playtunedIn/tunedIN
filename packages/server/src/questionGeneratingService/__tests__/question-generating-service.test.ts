import { describe, expect, it, beforeEach, vi } from 'vitest';
import * as questionGeneratingService from '../question-generating-service';
import { users } from '../../testing/mocks/question-generating-service/users';
import { shaynePlaylistData } from 'src/testing/mocks/question-generating-service/spotify-api/get-current-users-playlist';
import { shayneProfileData } from 'src/testing/mocks/question-generating-service/spotify-api/get-current-users-profile';
import { shayneTrackData } from 'src/testing/mocks/question-generating-service/spotify-api/get-recently-played-tracks';

import * as spotifyReqs from '../../clients/spotify/spotify-client';

describe('Question generating service', () => {
  beforeEach(() => {
    vi.spyOn(spotifyReqs, 'fetchRecentlyPlayedTracks').mockResolvedValue(shayneTrackData);
    vi.spyOn(spotifyReqs, 'fetchUserProfile').mockResolvedValue(shayneProfileData);
    vi.spyOn(spotifyReqs, 'fetchUserPlaylists').mockResolvedValue(shaynePlaylistData);
  });

  it('should generate the number of question results requested', async () => {
    const result = await questionGeneratingService.getGameQuestions(users, 4);
    expect(result).toHaveLength(4);
  });

  it('should generate the max number of available questions if requested more questions than available', async () => {
    const result = await questionGeneratingService.getGameQuestions(users, 23);
    expect(result).toHaveLength(19);
  });
});
