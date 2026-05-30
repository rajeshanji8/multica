/**
 * Encapsulates all todo state and the API interactions that mutate it.
 *
 * The full list is loaded once and filtered in-memory by the UI, which keeps
 * toggling/filtering instant and avoids refetch flicker. Mutations update
 * local state from the server's response so the UI stays in sync.
 */

import { useCallback, useEffect, useState } from 'react';
import { ApiError, todosApi } from '../api';
import type { Todo, UpdateTodoInput } from '../types';

interface UseTodosResult {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  addTodo: (title: string) => Promise<void>;
  updateTodo: (id: string, input: UpdateTodoInput) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
}

function toMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'Something went wrong.';
}

export function useTodos(): UseTodosResult {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await todosApi.list();
      setTodos(data);
    } catch (err) {
      setError(toMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const addTodo = useCallback(async (title: string) => {
    const created = await todosApi.create({ title });
    setTodos((prev) => [created, ...prev]);
  }, []);

  const updateTodo = useCallback(async (id: string, input: UpdateTodoInput) => {
    const updated = await todosApi.update(id, input);
    setTodos((prev) => prev.map((todo) => (todo.id === id ? updated : todo)));
  }, []);

  const deleteTodo = useCallback(async (id: string) => {
    await todosApi.remove(id);
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  return {
    todos,
    loading,
    error,
    reload: () => void load(),
    addTodo,
    updateTodo,
    deleteTodo,
  };
}
