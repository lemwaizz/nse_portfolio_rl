FROM oven/bun:alpine AS base

FROM base AS builder

WORKDIR /app

COPY package.json package.json
COPY bun.lock bun.lock
COPY apps/coordinator/package.json apps/coordinator/package.json
COPY apps/frontend/package.json apps/frontend/package.json
COPY packages/clients/package.json packages/clients/package.json

# RUN bun ci
RUN bun install
COPY . .
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN NODE_OPTIONS="--max-old-space-size=4096" bun run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache nginx su-exec

RUN adduser -D -g 'www' -u 1002 www
RUN adduser -D -u 1001 nextjs

RUN mkdir -p /www && \
    chown -R www:www /var/lib/nginx && \
    chown -R www:www /www && \
    chown -R www:www /var/log/nginx

COPY docker/nginx.conf /etc/nginx/nginx.conf

COPY --from=builder /app/apps/frontend/public ./apps/frontend/public

RUN mkdir -p /app/apps/frontend/.next && \
	mkdir -p /app/apps/coordinator && \
    chown -R nextjs:nextjs /app/apps/frontend/.next

COPY --from=builder --chown=nextjs:nextjs /app/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/apps/frontend/.next/static ./apps/frontend/.next/static

COPY --from=builder --chown=nextjs:nextjs /app/apps/coordinator/server ./apps/coordinator/server

RUN chmod +x ./apps/coordinator/server

RUN bun add pm2

COPY docker/ecosystem.config.js ecosystem.config.js
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

RUN chown -R nextjs:nextjs /app

CMD ["/entrypoint.sh"]

EXPOSE 3000