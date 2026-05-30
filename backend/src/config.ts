/**
 * Runtime configuration, resolved from environment variables with sensible
 * defaults so the server runs zero-config in development.
 */
export interface Config {
  /** Port the HTTP server listens on. */
  port: number;
  /** SQLite database file path, or ':memory:' for an ephemeral DB. */
  dbPath: string;
  /** Allowed CORS origin(s) for the browser frontend. */
  corsOrigin: string;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    port: Number(env.PORT ?? 3000),
    dbPath: env.DB_PATH ?? 'todos.db',
    // Vite dev server default; override with CORS_ORIGIN in other environments.
    corsOrigin: env.CORS_ORIGIN ?? 'http://localhost:5173',
  };
}
