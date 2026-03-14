FROM node:20-alpine AS base
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build
RUN pnpm add -D esbuild && npx esbuild lib/db/seed.ts --bundle --platform=node --outfile=seed.js --external:better-sqlite3
# 把 better-sqlite3 及其依赖打成一个干净的 node_modules 供 runner 使用
RUN mkdir -p /seed-deps/node_modules && \
    cp -r node_modules/better-sqlite3 /seed-deps/node_modules/ && \
    cp -r node_modules/.pnpm/better-sqlite3*/node_modules/* /seed-deps/node_modules/ 2>/dev/null || true && \
    cp -r node_modules/.pnpm/bindings*/node_modules/* /seed-deps/node_modules/ 2>/dev/null || true && \
    cp -r node_modules/.pnpm/file-uri-to-path*/node_modules/* /seed-deps/node_modules/ 2>/dev/null || true && \
    cp -r node_modules/.pnpm/prebuild-install*/node_modules/* /seed-deps/node_modules/ 2>/dev/null || true

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/seed.js ./seed.js
COPY --from=builder /seed-deps/node_modules ./node_modules
COPY docker-entrypoint.sh ./

RUN chmod +x docker-entrypoint.sh && mkdir -p data && chown nextjs:nodejs data

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENTRYPOINT ["./docker-entrypoint.sh"]
