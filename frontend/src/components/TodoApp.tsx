import { useMemo, useState } from 'react';
import { useTodos } from '../hooks/useTodos';
import type { Filter } from '../types';
import { AddTodo } from './AddTodo';
import { Filters } from './Filters';
import { TodoList } from './TodoList';

const EMPTY_MESSAGES: Record<Filter, string> = {
  all: 'No todos yet. Add your first one above.',
  active: 'Nothing active — you’re all caught up! 🎉',
  completed: 'No completed todos yet.',
};

/** Top-level component: owns state and composes the UI. */
export function TodoApp() {
  const { todos, loading, error, reload, addTodo, updateTodo, deleteTodo } = useTodos();
  const [filter, setFilter] = useState<Filter>('all');

  const counts = useMemo(
    () => ({
      all: todos.length,
      active: todos.filter((t) => !t.completed).length,
      completed: todos.filter((t) => t.completed).length,
    }),
    [todos],
  );

  const visibleTodos = useMemo(() => {
    switch (filter) {
      case 'active':
        return todos.filter((t) => !t.completed);
      case 'completed':
        return todos.filter((t) => t.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  return (
    <main className="app">
      <header className="app__header">
        <h1>Todo App</h1>
        {counts.all > 0 && (
          <p className="app__subtitle">
            {counts.active} active · {counts.completed} completed
          </p>
        )}
      </header>

      <AddTodo onAdd={addTodo} />

      <Filters value={filter} counts={counts} onChange={setFilter} />

      <section aria-live="polite" aria-busy={loading}>
        {loading && <p className="status status--loading">Loading todos…</p>}

        {!loading && error && (
          <div className="status status--error" role="alert">
            <span>{error}</span>
            <button type="button" className="btn btn--ghost" onClick={reload}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <TodoList
            todos={visibleTodos}
            emptyMessage={EMPTY_MESSAGES[filter]}
            onUpdate={updateTodo}
            onDelete={deleteTodo}
          />
        )}
      </section>
    </main>
  );
}
