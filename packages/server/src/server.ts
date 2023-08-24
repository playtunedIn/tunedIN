import cookieParser from 'cookie-parser';
import type { Request, Response } from 'express';
import express from 'express';
import cors from 'cors';
import type { WebSocket } from 'ws';
import { WebSocketServer } from 'ws';
import http from 'http';
import https from 'https';
import { readFileSync } from 'fs';

import { setupOauthRoutes } from './handlers/auth/oauth-handler';
import { messageHandler } from './handlers/message-handler';
import { validatorInit } from './handlers/message.validator';
import { heartbeat } from './handlers/websocket/websocket-handlers';
import { gameStateSubscriberClient } from './clients/redis';
import { authenticateToken } from './middleware/authenticate';
import { getSelf } from './clients/spotify/spotify-client';

validatorInit();

const WS_HEARTBEAT_INTERVAL = parseInt(process.env.WS_HEARTBEAT_INTERVAL || '30000');
const port = process.env.PORT || 3001;

const app = express();
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:3000' }));

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

  ws.on('error', console.error);

  ws.on('pong', () => heartbeat(ws));

  ws.on('close', () => {
    if (ws.channelListener) {
      gameStateSubscriberClient.unsubscribeFromChanges(ws.channelListener);
    }

    ws.close();
  });
});

const interval = setInterval(() => {
  // FIXME: Figure out type override for WebSocketServer to allow our custom WebSocket properties.
  wsServer.clients.forEach(_ws => {
    const ws = _ws as WebSocket;
    if (!ws.isAlive) {
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping();
  });
}, WS_HEARTBEAT_INTERVAL);

wsServer.on('close', () => {
  clearInterval(interval);

  wsServer.clients.forEach(_ws => {
    const ws = _ws as WebSocket;
    if (ws.channelListener) {
      gameStateSubscriberClient.unsubscribeFromChanges(ws.channelListener);
    }
  });
});
