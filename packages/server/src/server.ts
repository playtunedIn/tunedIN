import dotenv from 'dotenv';
// needs to run before imports
dotenv.config();
import * as express from 'express';
import cookieParser from 'cookie-parser';
import { setupOauthRoutes } from './oauth';

const PORT = process.env.PORT || 3001;

const app = express.default();
app.use(cookieParser());

setupOauthRoutes(app);

console.log(`Listening on ${PORT}`);
app.listen(PORT);
