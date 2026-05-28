// src/services/websocket.ts
import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

interface AuthenticatedClient {
  ws: WebSocket;
  userId: string;
  bbox: BoundingBox | null;
}

type WsMessage =
  | { type: 'SUBSCRIBE_BBOX'; bbox: BoundingBox }
  | { type: 'PING' };

const clients = new Map<string, AuthenticatedClient>();

/**
 * Initialise the WebSocket server on the same HTTP server as Express.
 */
export function initWebSocketServer(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    // Extract JWT from query string: ws://host/ws?token=<jwt>
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(4001, 'Missing token');
      return;
    }

    let userId: string;
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string };
      userId = payload.sub;
    } catch {
      ws.close(4003, 'Invalid token');
      return;
    }

    const client: AuthenticatedClient = { ws, userId, bbox: null };
    clients.set(userId, client);

    console.log(`[WS] Client connected: ${userId}. Total: ${clients.size}`);

    ws.on('message', (raw) => {
      try {
        const msg: WsMessage = JSON.parse(raw.toString());
        handleClientMessage(client, msg);
      } catch {
        // Ignore malformed messages
      }
    });

    ws.on('close', () => {
      clients.delete(userId);
      console.log(`[WS] Client disconnected: ${userId}. Total: ${clients.size}`);
    });

    ws.on('error', (err) => {
      console.error(`[WS] Error for ${userId}:`, err.message);
      clients.delete(userId);
    });

    // Send a welcome ping
    safeSend(ws, { type: 'CONNECTED', userId });
  });

  console.log('[WS] WebSocket server initialised at /ws');
  return wss;
}

function handleClientMessage(client: AuthenticatedClient, msg: WsMessage): void {
  if (msg.type === 'SUBSCRIBE_BBOX') {
    client.bbox = msg.bbox;
    safeSend(client.ws, { type: 'SUBSCRIBED', bbox: msg.bbox });
  } else if (msg.type === 'PING') {
    safeSend(client.ws, { type: 'PONG' });
  }
}

/**
 * Broadcast a new hazard report to all clients whose subscribed bounding box
 * contains the report's coordinates.
 */
export function broadcastNewReport(report: {
  id: string;
  category: string;
  latitude: number;
  longitude: number;
  description: string | null;
  photoUrl: string | null;
  upvotes: number;
  createdAt: Date;
  expiresAt: Date;
}): void {
  const payload = JSON.stringify({ type: 'NEW_REPORT', report });

  for (const client of clients.values()) {
    if (!client.bbox) continue;
    const { minLat, maxLat, minLng, maxLng } = client.bbox;
    if (
      report.latitude >= minLat &&
      report.latitude <= maxLat &&
      report.longitude >= minLng &&
      report.longitude <= maxLng
    ) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(payload);
      }
    }
  }
}

/**
 * Broadcast an upvote update to all subscribers in the relevant area.
 */
export function broadcastUpvote(reportId: string, upvotes: number): void {
  const payload = JSON.stringify({ type: 'UPVOTE_UPDATE', reportId, upvotes });
  for (const client of clients.values()) {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(payload);
    }
  }
}

function safeSend(ws: WebSocket, data: object): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

export function getConnectedClientCount(): number {
  return clients.size;
}
