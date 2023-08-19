import cookieParser from 'cookie-parser';
import express from 'express';
import type { WebSocket } from 'ws';
import { WebSocketServer } from 'ws';
import http from 'http';
import https from 'https';
import { readFileSync } from 'fs';

import { setupOauthRoutes } from './oauth';
import { messageHandler } from './handlers/message-handler';
import { validatorInit } from './handlers/message.validator';
import { gameStateSubscriberClient } from './clients/redis';

validatorInit();

const port = process.env.PORT || 3001;

const app = express();
app.use(cookieParser());

// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.get('/test', function (_: any, res: any) {
  res.send({ test: 'good' });
});

let server: https.Server | http.Server;
if (process.env.NODE_ENV === 'development') {
  const key = readFileSync('./.cert/server.key');
  const cert = readFileSync('./.cert/server.crt');

  server = https.createServer({ key, cert }, app);
} else {
  // TODO: update comment with correct wording if need be for api gateway
  /**
   * In production https credentials and keys will be handled by our api gateway allowing backend services
   * to not have to worry about expiring certificates
   */
  server = http.createServer(app);
}

server.keepAliveTimeout = 90000;
server.headersTimeout = 95000;

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

server.on('error', err => {
  console.error(err);
});

setupOauthRoutes(app);

const wsServer = new WebSocketServer({ server, path: '/ws/multiplayer' });

wsServer.on('connection', (ws: WebSocket) => {
  ws.on('message', (data: string) => {
    messageHandler(ws, data);
  });

  ws.on('close', () => {
    if (ws.channelListener) {
      gameStateSubscriberClient.unsubscribeFromChanges(ws.channelListener);
    }
  });

  ws.on('close', () => {
    ws.close();
  });
});
