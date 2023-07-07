/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */
import dotenv from 'dotenv';
import * as express from 'express';
import { setupOauthRoutes } from './oauth';

dotenv.config();

const PORT = process.env.PORT || 3001;

const app = express.default();

setupOauthRoutes(app);

console.log(`Listening on ${PORT}`);
app.listen(PORT);
