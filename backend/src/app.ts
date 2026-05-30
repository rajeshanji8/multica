import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import type { DB } from './db.js';
import { TodoRepository } from './repository.js';
import { createTodosRouter } from './routes/todos.js';

export interface AppOptions {
  db: DB;
  corsOrigin?: string;
}

/**
 * Build the Express application. Decoupled from `listen()` so tests can drive
 * it with supertest and inject an in-memory database.
 */
export function createApp({ db, corsOrigin }: AppOptions): Express {
  const app = express();

  app.use(cors({ origin: corsOrigin ?? true }));
  app.use(express.json());

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'todo-app-backend' });
  });

  const repo = new TodoRepository(db);
  app.use('/api/todos', createTodosRouter(repo));

  // 404 for unknown routes.
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'NotFound', message: 'Route not found' });
  });

  // Centralised error handler — covers malformed JSON bodies and unexpected errors.
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err && typeof err === 'object' && 'type' in err && err.type === 'entity.parse.failed') {
      res.status(400).json({ error: 'BadRequest', message: 'Invalid JSON body' });
      return;
    }
    console.error('[backend] unhandled error:', err);
    res.status(500).json({ error: 'InternalServerError', message: 'Something went wrong' });
  });

  return app;
}
