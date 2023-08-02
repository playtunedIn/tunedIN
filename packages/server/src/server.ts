import dotenv from 'dotenv';
// needs to run before imports
dotenv.config();
import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import { WebSocket, WebSocketServer } from 'ws';
import https from 'https';
import { readFileSync } from 'fs';

import { setupOauthRoutes } from './auth/oauth';
import { messageHandler } from './handlers/message-handler';
import { validatorInit } from './handlers/message.validator';
import { unsubscribeChannel } from './clients/redis/redis-client';
import { authenticateToken } from './auth/authenticate';
import { getSelf } from './clients/spotispy/spotify-client';

const key = readFileSync('./.cert/server.key');
const cert = readFileSync('./.cert/server.crt');

validatorInit();

const port = process.env.PORT || 3001;

const app = express();
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:3000' }));

const server = https.createServer({ key, cert }, app);
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

server.on('error', err => {
  console.error(err);
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.get('/test', function (_: any, res: any) {
  console.log('test');
  res.send({ test: 'good' });
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.get('/self', authenticateToken, async function (req: any, res: any) {
  const user = await getSelf(req.token);
  console.log({ user });
  res.send({ user });
});

setupOauthRoutes(app);

const wsServer = new WebSocketServer({ server, path: '/ws/multiplayer' });

wsServer.on('connection', (ws: WebSocket) => {
  ws.on('message', (data: string) => {
    messageHandler(ws, data);
  });

  ws.on('close', () => {
    if (ws.channelListener) {
      unsubscribeChannel(ws.channelListener);
    }
  });

  ws.on('close', () => {
    ws.close();
  });
});
