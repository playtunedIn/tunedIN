import type { TunedInJwtPayload } from 'src/utils/auth';

export const GLOBAL_MOCK_USER_ID = 'TEST ID';

export const createMockAuthContext = (): TunedInJwtPayload => ({
  spotifyToken: 'FAKE TOKEN',
  refresh: 'NEVER',
  userId: GLOBAL_MOCK_USER_ID,
  name: 'Jane Doe',
});
