/**
 * Typed client for the Todo REST API (T2 / PUN-8 contract).
 *
 * Endpoints:
 *   GET    /api/todos?completed=true|false
 *   POST   /api/todos            { title }            -> 201
 *   GET    /api/todos/:id
 *   PATCH  /api/todos/:id        { title?, completed? }
 *   DELETE /api/todos/:id                              -> 204
 *
 * The base URL comes from VITE_API_URL. When unset we use relative paths so
 * the Vite dev proxy / production reverse proxy can forward `/api/*`.
 */

import type { CreateTodoInput, Todo, UpdateTodoInput } from './types';

const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

/** Error carrying the HTTP status so callers can branch on it if needed. */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  } catch {
    // Network-level failure (server down, CORS, offline, …).
    throw new ApiError('Unable to reach the server. Is the backend running?', 0);
  }

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new ApiError(message, response.status);
  }

  // 204 No Content (delete) has no body to parse.
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string; message?: string };
    return data.error ?? data.message ?? `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}

export const todosApi = {
  list(filter?: boolean): Promise<Todo[]> {
    const query = filter === undefined ? '' : `?completed=${filter}`;
    return request<Todo[]>(`/api/todos${query}`);
  },

  create(input: CreateTodoInput): Promise<Todo> {
    return request<Todo>('/api/todos', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  update(id: string, input: UpdateTodoInput): Promise<Todo> {
    return request<Todo>(`/api/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  remove(id: string): Promise<void> {
    return request<void>(`/api/todos/${id}`, { method: 'DELETE' });
  },
};
