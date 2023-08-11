import jwt, { VerifyErrors, Secret, Jwt, JwtPayload } from 'jsonwebtoken';

export type TunedInJwtPayload = {
    spotifyToken: string;
    refresh: string;
    userId: string;
    name: string;
  };

export const verifyToken = (token: string) => {
    return new Promise((resolve, reject) => {
        jwt.verify(
            token,
            process.env.JWT_SIGNING_HASH as Secret,
            (err: VerifyErrors | null, payload: Jwt | JwtPayload | string | undefined) => {
            if (err || !payload) {
                reject();
            }
            const user = payload as TunedInJwtPayload;
            resolve(user);
        }
      );
    });
}