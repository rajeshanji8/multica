/**
 * Shared domain types for the Todo frontend.
 *
 * These mirror the T2 (PUN-8) API contract:
 *   Todo = { id, title, completed, createdAt, updatedAt }
 */

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Payload accepted by `POST /api/todos`. */
export interface CreateTodoInput {
  title: string;
}

/** Payload accepted by `PATCH /api/todos/:id`. */
export interface UpdateTodoInput {
  title?: string;
  completed?: boolean;
}

/** Active filter shown in the UI. */
export type Filter = 'all' | 'active' | 'completed';
