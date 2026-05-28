// src/index.ts
import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';
import { db } from './config/database';
import { initWebSocketServer } from './services/websocket';
import { errorHandler } from './middlewares/errorHandler';

import authRouter from './routes/auth';
import reportsRouter from './routes/reports';
import commentsRouter from './routes/comments';
import routingRouter from './routes/routing';
import profileRouter from './routes/profile';

// ─── Express App ──────────────────────────────────────────────────────────────

const app = express();

// Security headers
app.use(helmet());

// CORS – allow Telegram Mini App origins in production
app.use(
  cors({
    origin:
      env.NODE_ENV === 'production'
        ? ['https://web.telegram.org', 'https://t.me']
        : true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request logging
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Global rate limiter (generous; tighten per-route as needed)
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please slow down.' },
  })
);

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/auth/telegram', authRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/reports/:id/comments', commentsRouter);
app.use('/api/routing', routingRouter);
app.use('/api/profile', profileRouter);

// Health check
app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler (must come last)
app.use(errorHandler);

// ─── HTTP + WebSocket Server ──────────────────────────────────────────────────

const server = http.createServer(app);
initWebSocketServer(server);

// ─── Background Job: Archive Expired Reports ──────────────────────────────────

async function archiveExpiredReports(): Promise<void> {
  try {
    const { count } = await db.hazardReport.updateMany({
      where: { isActive: true, expiresAt: { lte: new Date() } },
      data: { isActive: false },
    });
    if (count > 0) {
      console.log(`[Cron] Archived ${count} expired report(s)`);
    }
  } catch (err) {
    console.error('[Cron] Failed to archive reports:', err);
  }
}

// Run every 5 minutes
setInterval(archiveExpiredReports, 5 * 60 * 1000);

// ─── Start ────────────────────────────────────────────────────────────────────

const PORT = Number(env.PORT);

server.listen(PORT, () => {
  console.log(`\n🚀  Hazard API running on http://localhost:${PORT}`);
  console.log(`📡  WebSocket endpoint: ws://localhost:${PORT}/ws?token=<jwt>`);
  console.log(`🌍  Environment: ${env.NODE_ENV}\n`);

  // Run archive job immediately on startup
  archiveExpiredReports();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully…');
  server.close(async () => {
    await db.$disconnect();
    process.exit(0);
  });
});

export default app;
