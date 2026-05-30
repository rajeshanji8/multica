/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Base URL of the backend API (e.g. "http://localhost:3000").
   * When empty, requests are made to the same origin and rely on the Vite
   * dev-server proxy (see vite.config.ts) or the production reverse proxy.
   */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
