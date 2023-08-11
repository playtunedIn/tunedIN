import dotenv from 'dotenv';
// needs to run before imports
dotenv.config();
import cookieParser from 'cookie-parser';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { WebSocket, WebSocketServer } from 'ws';
import https from 'https';
import { readFileSync } from 'fs';

import { setupOauthRoutes } from './handlers/auth/oauth-handler';
import { messageHandler } from './handlers/message-handler';
import { validatorInit } from './handlers/message.validator';
import { unsubscribeChannel } from './clients/redis/redis-client';
import { authenticateToken } from './middleware/authenticate';
import { getSelf } from './clients/spotify/spotify-client';

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

app.get('/test', function (_: Request, res: Response) {
  res.send({ test: 'good' });
});

app.get('/self', authenticateToken, async function (req: Request, res: Response) {
  if (req.token) {
    const user = await getSelf(req.token);
    res.send({ user });
  } else {
    res.sendStatus(401);
  }
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
