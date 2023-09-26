import type { TunedInJwtPayload } from 'src/utils/auth';

export const GLOBAL_MOCK_USER_ID = 'TEST ID';
export const GLOBAL_MOCK_NAME = 'Jane Doe';
export const GLOBAL_MOCK_REFRESH = 'NEVER';
export const GLOBAL_MOCK_SPOTIFY_TOKEN = 'FAKE TOKEN';

export const createMockAuthContext = (): TunedInJwtPayload => ({
  spotifyToken: GLOBAL_MOCK_SPOTIFY_TOKEN,
  refresh: GLOBAL_MOCK_REFRESH,
  userId: GLOBAL_MOCK_USER_ID,
  name: GLOBAL_MOCK_NAME,
});
