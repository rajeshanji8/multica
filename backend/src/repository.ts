import { randomUUID } from 'node:crypto';
import type { DB } from './db.js';
import type { Todo, TodoRow } from './types.js';
import type { CreateTodoInput, UpdateTodoInput } from './schemas.js';

function rowToTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    title: row.title,
    completed: Boolean(row.completed),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Data-access layer for todos. Keeps SQL and row<->domain mapping in one place
 * so route handlers stay thin.
 */
export class TodoRepository {
  constructor(private readonly db: DB) {}

  list(completed?: boolean): Todo[] {
    const rows =
      completed === undefined
        ? (this.db.prepare('SELECT * FROM todos ORDER BY createdAt DESC').all() as TodoRow[])
        : (this.db
            .prepare('SELECT * FROM todos WHERE completed = ? ORDER BY createdAt DESC')
            .all(completed ? 1 : 0) as TodoRow[]);
    return rows.map(rowToTodo);
  }

  getById(id: string): Todo | undefined {
    const row = this.db.prepare('SELECT * FROM todos WHERE id = ?').get(id) as TodoRow | undefined;
    return row ? rowToTodo(row) : undefined;
  }

  create(input: CreateTodoInput): Todo {
    const now = new Date().toISOString();
    const todo: Todo = {
      id: randomUUID(),
      title: input.title,
      completed: input.completed ?? false,
      createdAt: now,
      updatedAt: now,
    };
    this.db
      .prepare(
        'INSERT INTO todos (id, title, completed, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
      )
      .run(todo.id, todo.title, todo.completed ? 1 : 0, todo.createdAt, todo.updatedAt);
    return todo;
  }

  /** Returns the updated todo, or undefined if no row with `id` exists. */
  update(id: string, input: UpdateTodoInput): Todo | undefined {
    const existing = this.getById(id);
    if (!existing) return undefined;

    const updated: Todo = {
      ...existing,
      title: input.title ?? existing.title,
      completed: input.completed ?? existing.completed,
      updatedAt: new Date().toISOString(),
    };
    this.db
      .prepare('UPDATE todos SET title = ?, completed = ?, updatedAt = ? WHERE id = ?')
      .run(updated.title, updated.completed ? 1 : 0, updated.updatedAt, id);
    return updated;
  }

  /** Returns true if a row was deleted. */
  delete(id: string): boolean {
    const result = this.db.prepare('DELETE FROM todos WHERE id = ?').run(id);
    return result.changes > 0;
  }
}
