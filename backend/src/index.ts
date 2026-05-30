import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { createDatabase } from './db.js';

const config = loadConfig();
const db = createDatabase(config.dbPath);
const app = createApp({ db, corsOrigin: config.corsOrigin });

const server = app.listen(config.port, () => {
  console.log(`[backend] listening on http://localhost:${config.port}`);
});

// Close the DB cleanly on shutdown so WAL data is flushed.
function shutdown(signal: string): void {
  console.log(`[backend] received ${signal}, shutting down`);
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
