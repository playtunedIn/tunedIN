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
import { authenticateToken } from './middleware/authenticate';
import { getSelf } from './clients/spotify/spotify-client';
import { gameStateSubscriberClient } from './clients/redis';
import type { TunedInJwtPayload } from './utils/auth';
import { verifyToken } from './utils/auth';

const port = process.env.PORT || 3001;

const app = express();
app.use(cookieParser());
app.use(cors({ origin: 'https://local.playtunedin-test.com:8080' }));

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

const wsServer = new WebSocketServer({
  server,
  path: '/ws/multiplayer',
});

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

server.on('upgrade', async function upgrade(request, socket, head) {
  let payload: TunedInJwtPayload | null = null;

  try {
    const token = request.headers.token as string;
    if (!token) {
      return;
    }
    payload = await verifyToken(token);
  } catch (e) {
    socket.destroy();
    return;
  }

  wsServer.handleUpgrade(request, socket, head, function done(ws) {
    wsServer.emit('connection', ws, request, payload);
  });
});
