import { z } from 'zod';

/** Body for POST /api/todos. */
export const createTodoSchema = z
  .object({
    title: z.string().trim().min(1, 'title is required').max(500),
    completed: z.boolean().optional(),
  })
  .strict();

/** Body for PATCH /api/todos/:id — at least one field must be present. */
export const updateTodoSchema = z
  .object({
    title: z.string().trim().min(1, 'title must not be empty').max(500).optional(),
    completed: z.boolean().optional(),
  })
  .strict()
  .refine((data) => data.title !== undefined || data.completed !== undefined, {
    message: 'at least one of "title" or "completed" must be provided',
  });

/** Query for GET /api/todos — optional completed filter. */
export const listTodosQuerySchema = z
  .object({
    completed: z
      .enum(['true', 'false'])
      .transform((value) => value === 'true')
      .optional(),
  })
  .strip();

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type ListTodosQuery = z.infer<typeof listTodosQuerySchema>;
