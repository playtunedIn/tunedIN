import jwt, { type VerifyErrors, type Secret, type Jwt, type JwtPayload } from 'jsonwebtoken';

export type TunedInJwtPayload = {
  spotifyToken: string;
  refresh: string;
  userId: string;
  name: string;
};

export const verifyToken = (token: string): Promise<TunedInJwtPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      process.env.JWT_SIGNING_HASH as Secret,
      (err: VerifyErrors | null, payload: Jwt | JwtPayload | string | undefined) => {
        if (err || !payload) {
          reject(err);
        }
        const user = payload as TunedInJwtPayload;
        resolve(user);
      }
    );
  });
};

export const getCookie = (cookieString: string | undefined, cookieName: string): string | undefined => {
  return cookieString
    ?.split(';')
    .map(vals => vals.split('='))
    .filter(vals => vals[0] === cookieName)
    .map(vals => vals[1])?.[0];
};
