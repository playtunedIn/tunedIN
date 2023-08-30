import type { VerifyErrors, Secret, Jwt, JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import { decrypt } from '../utils/crypto';
import type { TunedInJwtPayload } from 'src/handlers/auth/oauth-handler';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authenticateToken = (req: any, res: any, next: () => void) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(
    token,
    process.env.JWT_SIGNING_HASH as Secret,
    (err: VerifyErrors | null, payload: Jwt | JwtPayload | string | undefined) => {
      if (err || !payload) {
        return res.sendStatus(403);
      }
      const user = payload as TunedInJwtPayload;
      req.user = user;
      req.token = decrypt(user.spotifyToken);
      next();
    }
  );
};
