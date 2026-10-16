# syntax=docker/dockerfile:1
# =============================================================
# KUENEERE API — Production image (multi-stage)
#   1) deps      : бүх dependency (build хийхэд devDeps хэрэгтэй)
#   2) build     : TypeScript → dist/
#   3) prod-deps : зөвхөн runtime dependency
#   4) runtime   : жижиг, non-root image
# =============================================================
ARG NODE_VERSION=20-alpine

FROM node:${NODE_VERSION} AS base
WORKDIR /app

# ---- 1) deps ----
FROM base AS deps
# bcrypt нь native module — prebuilt олдохгүй бол compile хийхэд хэрэгтэй
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
RUN npm ci

# ---- 2) build ----
FROM deps AS build
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npx nest build && test -f dist/main.js

# ---- 3) prod-deps ----
FROM deps AS prod-deps
RUN npm prune --omit=dev && npm cache clean --force

# ---- 4) runtime ----
FROM base AS runtime
ENV NODE_ENV=production \
    PORT=3003
COPY --chown=node:node package.json ./
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
# S3 тохируулаагүй үед зураг хадгалах хавтас (docker-compose-д volume)
RUN mkdir -p /app/uploads && chown node:node /app/uploads

USER node
EXPOSE 3003

# /health endpoint (app.controller.ts) — docker ps дээр (healthy) гэж харагдана
HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=5 \
  CMD wget -qO- http://127.0.0.1:${PORT}/health || exit 1

CMD ["node", "dist/main"]
