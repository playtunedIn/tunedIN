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
import { heartbeat, messageHandler } from './handlers/websocket/websocket-handlers';
import { gameStateSubscriberClient, gameStatePublisherClient, playerStatePublisherClient } from './clients/redis';
import { authenticateToken } from './middleware/authenticate';
import { getSelf } from './clients/spotify/spotify-client';
import type { TunedInJwtPayload } from './utils/auth';
import { unsubscribeRoomHandler } from './handlers/subscribed-message-handlers';
import { getCookie, verifyToken } from './utils/auth';

const WS_HEARTBEAT_INTERVAL = parseInt(process.env.WS_HEARTBEAT_INTERVAL || '30000');

const IGNORE_HEARTBEAT_INTERVAL =
  process.env.NODE_ENV === 'development' && process.env.IGNORE_HEARTBEAT_INTERVAL === 'true';
const port = process.env.PORT || 3001;

const startServer = async () => {
  /**
   * Connect redis clients
   */
  try {
    await Promise.all([
      gameStatePublisherClient.connect(),
      gameStateSubscriberClient.connect(),
      playerStatePublisherClient.connect(),
    ]);
  } catch {
    // TODO: Add tracking here
    process.exit(1);
  }

  /**
   * Create Express app
   */
  const app = express();
  app.use(cookieParser());
  app.use(cors({ origin: 'https://localhost:19006' }));

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

  /**
   * Create http server
   */
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

  /**
   * Create Websocket Server
   */
  const wsServer = new WebSocketServer({ noServer: true, path: '/ws/multiplayer' });

  /**
   * Handle authenticating Websocket connections
   */
  server.on('upgrade', (req, socket, head) => {
    /**
     * TODO: Investigate if we can send a proper unauthorized response before handling the upgrade to websocket
     *
     * Git issue: https://github.com/websockets/ws/issues/377#issuecomment-1694386948
     */
    wsServer.handleUpgrade(req, socket, head, async ws => {
      const tokenValue = getCookie(req.headers.cookie, 'TUNEDIN_TOKEN');

      if (typeof tokenValue !== 'string') {
        console.log('Token not found');
        ws.close(4001);
        return;
      }

      let userToken: TunedInJwtPayload;
      try {
        userToken = await verifyToken(tokenValue);
      } catch {
        console.log('Error verifying token');
        ws.close(4001);
        return;
      }
      wsServer.emit('connection', ws, req, userToken);
    });
  });

  /**
   * Websocket event handlers
   */
  wsServer.on('connection', (ws: WebSocket, _: Request, userToken: TunedInJwtPayload) => {
    ws.userToken = userToken;
    ws.isAlive = true;

    ws.on('message', (data: string) => {
      messageHandler(ws, data);
    });

    ws.on('error', console.error);

    ws.on('pong', () => heartbeat(ws));

    ws.on('close', () => {
      unsubscribeRoomHandler(ws);
      ws.close();
    });
  });

  /**
   * This interval is difficult to test websockets in non-webapp environments
   *
   * The IGNORE_INTERVAL environment variable allows you to turn the interval logic off
   *
   */
  const interval = setInterval(() => {
    if (IGNORE_HEARTBEAT_INTERVAL) {
      return;
    }

    wsServer.clients.forEach(_ws => {
      // FIXME: Figure out type override for WebSocketServer to allow our custom WebSocket properties.
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
      unsubscribeRoomHandler(ws);
    });
  });
};

startServer();
