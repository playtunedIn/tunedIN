/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */
/* https://www.digitalocean.com/community/tutorials/nodejs-jwt-expressjs */

import querystring from 'querystring';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import { encrypt } from '../../utils/crypto';
import { getSelf } from '../../clients/spotify/spotify-client';
import type { Request, Response } from 'express';
import type { TunedInJwtPayload } from 'src/utils/auth';
import { getGameQuestions } from '../../questionGeneratingService/question-generating-service';

const CLIENT_ID = process.env.CLIENT_ID || ''; // Your client id
const CLIENT_SECRET = process.env.CLIENT_SECRET || ''; // Your secret
const JWT_SIGNING_HASH = process.env.JWT_SIGNING_HASH || '';
const REDIRECT_URI = process.env.REDIRECT_URI || ''; // Your redirect uri
const POST_LOGIN_URL = process.env.POST_LOGIN_URL || ''; // After success

const DAY_IN_SECONDS = 86400;
const SCOPE = 'user-read-recently-played user-read-private user-read-email'; //to allow hitting recent tracks endpoint
const STATE_KEY = 'spotify_auth_state';

type OauthResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
};

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
const generateRandomString = function (length: number) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

function generateAccessToken(data: TunedInJwtPayload, expirySeconds: number): string {
  return jwt.sign(data, JWT_SIGNING_HASH, { expiresIn: `${expirySeconds}s` });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setupOauthRoutes = (app: any) => {
  app.get('/login', function (_: Request, res: Response) {
    const state = generateRandomString(16);
    res.cookie(STATE_KEY, state);

    // your application requests authorization
    res.redirect(
      'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
          response_type: 'code',
          client_id: CLIENT_ID,
          scope: SCOPE,
          redirect_uri: REDIRECT_URI,
          state: state,
        })
    );
  });

  app.get('/callback', async function (req: Request, res: Response) {
    // your application requests refresh and access tokens
    // after checking the state parameter

    const code = req.query.code;
    const state = req.query.state;
    const storedState = req.cookies ? req.cookies[STATE_KEY] : null;
    if (!code) {
      console.log('no code received');
    } else if (state === null || state !== storedState) {
      console.log('state mismatch');
      // res.redirect('/#' +
      //   querystring.stringify({
      //     error: 'state_mismatch'
      //   }));
    } else {
      res.clearCookie(STATE_KEY);
      const params = new URLSearchParams();
      params.append('code', code.toString());
      params.append('redirect_uri', REDIRECT_URI);
      params.append('grant_type', 'authorization_code');
      const authOptions = {
        method: 'POST',

        body: params,
        headers: {
          Authorization: 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
        },
      };
      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', authOptions);
      if (tokenResponse.status === 200) {
        const body = (await tokenResponse.json()) as OauthResponse;
        const access_token = body.access_token;
        const profileBody = await getSelf(access_token);

        const matthew = {
          name: 'Matt',
          token: access_token
        };

        console.log({access_token});
        console.log('working');

        const result = await getGameQuestions([matthew], 3);
        console.log({result});

        const encryptedAccessToken = encrypt(access_token);
        const encryptedRefreshToken = encrypt(body.refresh_token);
        if (encryptedAccessToken && encryptedRefreshToken) {
          const jwt = generateAccessToken(
            {
              spotifyToken: encryptedAccessToken,
              refresh: encryptedRefreshToken,
              userId: profileBody.uri,
              name: profileBody.display_name,
            },
            body.expires_in
          );

          res.cookie('TUNEDIN_TOKEN', jwt, {
            secure: process.env.NODE_ENV !== 'development',
            httpOnly: true,
            expires: new Date(Date.now() + body.expires_in * 1000),
          });

          res.redirect(
            POST_LOGIN_URL +
              querystring.stringify({
                token: jwt,
              })
          );
        }
      } else {
        console.log('invalid token');
        // res.redirect('/#' +
        //   querystring.stringify({
        //     error: 'invalid_token'
        //   }));
      }
    }
  });

  app.get('/refresh_token', async function (req: Request, res: Response) {
    // requesting access token from refresh token
    const refresh_token = req.query.refresh_token;
    const authOptions = {
      method: 'POST',
      headers: { Authorization: 'Basic ' + new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64') },
      form: {
        grant_type: 'refresh_token',
        refresh_token: refresh_token,
      },
    };

    const response = await fetch('https://accounts.spotify.com/api/token', authOptions);
    if (response.status === 200) {
      const body = (await response.json()) as OauthResponse;
      const access_token = body.access_token;
      res.send({
        access_token: access_token,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log('handling');
    app.get('/gen-mock-token', async function (req: Request, res: Response) {
      console.log('in handler');
      const expiresIn = DAY_IN_SECONDS * 30; // 30 days
      const uid = Date.now().toString();
      const jwt = generateAccessToken(
        {
          spotifyToken: encrypt('fake') || '',
          refresh: encrypt('fake') || '',
          userId: uid, // mock token uses timestamp as unique-enough id
          name: `fake ${uid}`,
        },
        expiresIn
      );
      res.cookie('TUNEDIN_TOKEN', jwt, {
        httpOnly: true,
        expires: new Date(Date.now() + expiresIn * 1000), // millisecond timestamp
      });
      console.log({ jwt });
      res.redirect(
        POST_LOGIN_URL +
          querystring.stringify({
            token: jwt,
          })
      );
    });
  }
};
