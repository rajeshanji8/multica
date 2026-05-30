# syntax=docker/dockerfile:1

# Backend image — Express + better-sqlite3 REST API.
# Build context is the repo ROOT (see docker-compose.yml) so the workspace
# lockfile is available for a reproducible install.

# ---- deps: production node_modules (incl. native better-sqlite3) ----
FROM node:20-bookworm-slim AS deps
WORKDIR /app
# Toolchain for compiling better-sqlite3 if no prebuilt binary is available.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY backend/package.json ./package.json
RUN npm install --omit=dev --no-audit --no-fund

# ---- build: compile TypeScript to dist/ ----
FROM node:20-bookworm-slim AS build
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
# Install the full workspace tree from the lockfile, then build just the backend.
COPY package.json package-lock.json tsconfig.base.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
RUN npm ci --no-audit --no-fund
COPY backend ./backend
RUN npm run build --workspace @todo-app/backend

# ---- runtime: slim image with prod deps + compiled output ----
FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production \
    PORT=3000 \
    DB_PATH=/data/todos.db
WORKDIR /app
COPY --from=deps  /app/node_modules ./node_modules
COPY --from=build /app/backend/dist ./dist
COPY backend/package.json ./package.json
# Persisted SQLite lives on a volume mounted at /data; run as the non-root
# `node` user that ships with the base image.
RUN mkdir -p /data && chown -R node:node /data /app
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=5 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/index.js"]
