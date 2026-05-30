import express, { type Request, type Response } from 'express';

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

app.use(express.json());

// Placeholder health check — the real Todo REST API lands in T2 (PUN-8).
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'todo-app-backend' });
});

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Todo API placeholder. See T2 (PUN-8) for the real endpoints.' });
});

app.listen(PORT, () => {
  console.log(`[backend] listening on http://localhost:${PORT}`);
});
