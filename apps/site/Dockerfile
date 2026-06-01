# govcms public site — Next.js standalone, multi-stage build.
# Build from the repo root:  docker build -f apps/site/Dockerfile -t govcms-site .
FROM node:22-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /repo

FROM base AS build
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/design-system/package.json packages/design-system/
COPY apps/site/package.json apps/site/
RUN pnpm install --frozen-lockfile
COPY packages/design-system packages/design-system
COPY apps/site apps/site
# API_URL is baked for any build-time fetches; override at runtime too.
ARG API_URL=http://core:4000/api
ENV API_URL=$API_URL
RUN pnpm --filter @govcms/site build

FROM base AS run
WORKDIR /app
ENV NODE_ENV=production
# Next standalone output is self-contained.
COPY --from=build /repo/apps/site/.next/standalone ./
COPY --from=build /repo/apps/site/.next/static ./apps/site/.next/static
COPY --from=build /repo/apps/site/public ./apps/site/public
EXPOSE 4004
ENV PORT=4004
CMD ["node", "apps/site/server.js"]
