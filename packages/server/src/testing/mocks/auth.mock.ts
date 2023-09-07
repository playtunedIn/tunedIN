import type { TunedInJwtPayload } from 'src/utils/auth';

export const createMockAuthContext = (): TunedInJwtPayload => ({
  spotifyToken: 'FAKE TOKEN',
  refresh: 'NEVER',
  userId: 'TEST ID',
  name: 'Jane Doe',
});
