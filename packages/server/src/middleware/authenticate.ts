import { decrypt } from '../utils/crypto';
import { type TunedInJwtPayload, verifyToken } from '../utils/auth';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authenticateToken = (req: any, res: any, next: () => void) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);
  verifyToken(token)
    .then(payload => {
      const user = payload as TunedInJwtPayload;
      req.user = user;

      req.token = decrypt(user.spotifyToken);
      next();
    })
    .catch(() => res.sendStatus(403));
};
