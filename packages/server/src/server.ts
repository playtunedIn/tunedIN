import express from 'express';
import { WebSocket, WebSocketServer } from 'ws';
import https from 'https';
import { readFileSync } from 'fs';

import { messageHandler } from './handlers/message-handler';
import { validatorInit } from './handlers/message.validator';
import { unsubscribeChannel } from './clients/redis/redis-client';

const key = readFileSync('./.cert/private.key');
const cert = readFileSync('./.cert/certificate.crt');

validatorInit();

const app = express();
const port = process.env.PORT || 3001;

app.get('/', (_, res) => {
  res.send('Hello, Express!');
});

const server = https.createServer({ key, cert }, app);
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

server.on('error', err => {
  console.error(err);
});

const wsServer = new WebSocketServer({ server });

wsServer.on('connection', (ws: WebSocket) => {
  ws.on('message', (data: string) => {
    messageHandler(ws, data);
  });

  ws.on('close', () => {
    if (ws.channelListener) {
      unsubscribeChannel(ws.channelListener);
    }
  });
});
