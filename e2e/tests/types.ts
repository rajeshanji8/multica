/** Minimal Todo shape mirroring the API contract — used for typed API helpers. */
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}
