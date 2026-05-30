# syntax=docker/dockerfile:1

# Frontend image — build the Vite SPA, serve the static bundle via nginx,
# and reverse-proxy /api + /health to the backend container.
# Build context is the repo ROOT (see docker-compose.yml).

# ---- build: produce the static bundle ----
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
RUN npm ci --no-audit --no-fund
COPY frontend ./frontend
# VITE_API_URL is intentionally left empty so the app calls relative /api paths,
# which nginx proxies to the backend (no CORS, same origin in production).
RUN npm run build --workspace @todo-app/frontend

# ---- runtime: nginx serving static files + API proxy ----
FROM nginx:1.27-alpine AS runtime
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=5 \
  CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1
CMD ["nginx", "-g", "daemon off;"]
