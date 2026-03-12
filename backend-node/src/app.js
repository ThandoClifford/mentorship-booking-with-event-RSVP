import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { v1Router } from './routes/v1.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json({ limit: '1mb' }));

  app.use('/api/v1', v1Router);

  app.use((err, _req, res, _next) => {
    const status = err?.status || 500;
    const message = status === 500 ? 'Server error' : err.message;
    res.status(status).json({ success: false, message, data: null });
  });

  return app;
}
