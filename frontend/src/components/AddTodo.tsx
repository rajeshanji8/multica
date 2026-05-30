import { useState, type FormEvent } from 'react';

interface AddTodoProps {
  onAdd: (title: string) => Promise<void>;
}

/** Input + button to add a new todo, with an empty-title guard. */
export function AddTodo({ onAdd }: AddTodoProps) {
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Please enter a title.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onAdd(trimmed);
      setTitle('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add todo.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="add-todo" onSubmit={handleSubmit} noValidate>
      <label className="sr-only" htmlFor="new-todo">
        New todo
      </label>
      <input
        id="new-todo"
        className="add-todo__input"
        type="text"
        placeholder="What needs to be done?"
        value={title}
        onChange={(event) => {
          setTitle(event.target.value);
          if (error) setError(null);
        }}
        disabled={submitting}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? 'add-todo-error' : undefined}
        autoFocus
      />
      <button className="btn btn--primary" type="submit" disabled={submitting}>
        {submitting ? 'Adding…' : 'Add'}
      </button>
      {error && (
        <p id="add-todo-error" className="add-todo__error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
