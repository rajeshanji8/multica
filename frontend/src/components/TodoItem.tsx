import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { Todo, UpdateTodoInput } from '../types';

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: string, input: UpdateTodoInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

/** A single todo row: toggle complete, edit title inline, or delete. */
export function TodoItem({ todo, onUpdate, onDelete }: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  }

  function startEditing() {
    setDraft(todo.title);
    setEditing(true);
  }

  async function commitEdit() {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === todo.title) {
      setEditing(false);
      setDraft(todo.title);
      return;
    }
    await run(() => onUpdate(todo.id, { title: trimmed }));
    setEditing(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      void commitEdit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setEditing(false);
      setDraft(todo.title);
    }
  }

  return (
    <li className={`todo${todo.completed ? ' todo--completed' : ''}`}>
      <input
        className="todo__checkbox"
        type="checkbox"
        checked={todo.completed}
        disabled={busy}
        aria-label={`Mark "${todo.title}" as ${todo.completed ? 'active' : 'completed'}`}
        onChange={() => run(() => onUpdate(todo.id, { completed: !todo.completed }))}
      />

      {editing ? (
        <input
          ref={inputRef}
          className="todo__edit"
          type="text"
          value={draft}
          disabled={busy}
          aria-label="Edit todo title"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => void commitEdit()}
        />
      ) : (
        <button
          type="button"
          className="todo__title"
          onDoubleClick={startEditing}
          title="Double-click to edit"
        >
          {todo.title}
        </button>
      )}

      <div className="todo__actions">
        {!editing && (
          <button
            type="button"
            className="btn btn--ghost"
            onClick={startEditing}
            disabled={busy}
            aria-label={`Edit "${todo.title}"`}
          >
            Edit
          </button>
        )}
        <button
          type="button"
          className="btn btn--danger"
          onClick={() => run(() => onDelete(todo.id))}
          disabled={busy}
          aria-label={`Delete "${todo.title}"`}
        >
          Delete
        </button>
      </div>
    </li>
  );
}
