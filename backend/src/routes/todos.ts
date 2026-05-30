import { Router, type Request, type Response } from 'express';
import { ZodError } from 'zod';
import type { TodoRepository } from '../repository.js';
import { createTodoSchema, listTodosQuerySchema, updateTodoSchema } from '../schemas.js';

function sendValidationError(res: Response, error: ZodError): void {
  res.status(400).json({
    error: 'ValidationError',
    details: error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    })),
  });
}

export function createTodosRouter(repo: TodoRepository): Router {
  const router = Router();

  // GET /api/todos?completed=true|false
  router.get('/', (req: Request, res: Response) => {
    const parsed = listTodosQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      sendValidationError(res, parsed.error);
      return;
    }
    res.json(repo.list(parsed.data.completed));
  });

  // POST /api/todos
  router.post('/', (req: Request, res: Response) => {
    const parsed = createTodoSchema.safeParse(req.body);
    if (!parsed.success) {
      sendValidationError(res, parsed.error);
      return;
    }
    const todo = repo.create(parsed.data);
    res.status(201).json(todo);
  });

  // GET /api/todos/:id
  router.get('/:id', (req: Request, res: Response) => {
    const todo = repo.getById(req.params.id);
    if (!todo) {
      res.status(404).json({ error: 'NotFound', message: 'Todo not found' });
      return;
    }
    res.json(todo);
  });

  // PATCH /api/todos/:id
  router.patch('/:id', (req: Request, res: Response) => {
    const parsed = updateTodoSchema.safeParse(req.body);
    if (!parsed.success) {
      sendValidationError(res, parsed.error);
      return;
    }
    const todo = repo.update(req.params.id, parsed.data);
    if (!todo) {
      res.status(404).json({ error: 'NotFound', message: 'Todo not found' });
      return;
    }
    res.json(todo);
  });

  // DELETE /api/todos/:id
  router.delete('/:id', (req: Request, res: Response) => {
    const deleted = repo.delete(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'NotFound', message: 'Todo not found' });
      return;
    }
    res.status(204).send();
  });

  return router;
}
