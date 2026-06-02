# govcms Core API — multi-stage build.
# Build from the repo root:  docker build -f apps/core/Dockerfile -t govcms-core .
FROM node:22-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /repo

# --- deps + build ---
FROM base AS build
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/schema/package.json packages/schema/
COPY apps/core/package.json apps/core/
RUN pnpm install --frozen-lockfile
COPY packages/schema packages/schema
COPY apps/core apps/core
RUN pnpm --filter @govcms/schema build \
  && pnpm --filter @govcms/core exec prisma generate \
  && pnpm --filter @govcms/core build \
  && pnpm deploy --filter @govcms/core --prod /app

# --- runtime ---
FROM base AS run
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app /app
COPY --from=build /repo/apps/core/dist ./dist
COPY --from=build /repo/apps/core/prisma ./prisma
EXPOSE 4000
# Apply migrations, then start.
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node dist/main.js"]
