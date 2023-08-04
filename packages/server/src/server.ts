import dotenv from 'dotenv';
// needs to run before imports
dotenv.config();
import cookieParser from 'cookie-parser';
import express from 'express';
import { WebSocket, WebSocketServer } from 'ws';
import https from 'https';
import { readFileSync } from 'fs';

import { setupOauthRoutes } from './oauth';
import { messageHandler } from './handlers/message-handler';
import { validatorInit } from './handlers/message.validator';
import { unsubscribeChannel } from './clients/redis/redis-client';

const key = readFileSync('./.cert/server.key');
const cert = readFileSync('./.cert/server.crt');

validatorInit();

const port = process.env.PORT || 3001;

const app = express();
app.use(cookieParser());

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
