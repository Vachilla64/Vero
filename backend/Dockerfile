# syntax=docker/dockerfile:1

# ---------- Stage 1: build dependencies ----------
# Debian (not Alpine) on purpose: bcrypt ships prebuilt binaries for glibc.
# On musl it would compile from source on every build.
FROM node:22-bookworm-slim AS builder

# openssl        -> required by the Prisma query engine
# python3/make/g++ -> only used if bcrypt has no prebuild for the build arch
RUN apt-get update && apt-get install -y --no-install-recommends \
      openssl \
      python3 \
      make \
      g++ \
    && rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# Pinned: bare `corepack enable` resolves pnpm@latest, which has broken
# the build before by requiring Node builtins newer than the base image.
RUN corepack enable && corepack prepare pnpm@10.28.1 --activate

WORKDIR /app

# prisma/ must land before install: package.json has a postinstall
# hook that runs `prisma generate` against prisma/schema.prisma.
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

RUN pnpm install --frozen-lockfile --prod

# ---------- Stage 2: runtime ----------
FROM node:22-bookworm-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
      openssl \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /app && chown node:node /app

ENV NODE_ENV=production
ENV PORT=8080

WORKDIR /app

COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .

USER node

EXPOSE 8080

# Schema sync and seeding are deliberately NOT run here.
# prisma/seed.js truncates every table, so running it on boot would
# wipe production data on each redeploy. Both are one-time manual steps.
CMD ["node", "server.js"]
