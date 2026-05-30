/** A Todo as exposed by the API. */
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Raw row shape as stored in SQLite. SQLite has no native boolean type, so
 * `completed` is persisted as an integer (0/1) and mapped on read.
 */
export interface TodoRow {
  id: string;
  title: string;
  completed: number;
  createdAt: string;
  updatedAt: string;
}
