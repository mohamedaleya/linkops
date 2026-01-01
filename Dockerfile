FROM oven/bun:1-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json bun.lockb* ./
COPY prisma ./prisma/


RUN bun install --frozen-lockfile

FROM oven/bun:1.3.2-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN bunx --bun prisma generate

# Build argument for NEXT_PUBLIC_URL (baked into client bundle at build time)
ARG NEXT_PUBLIC_URL
ENV NEXT_PUBLIC_URL=$NEXT_PUBLIC_URL

RUN bun run build



FROM oven/bun:1.3.2-alpine AS runner
WORKDIR /app
RUN apk add --no-cache curl libc6-compat

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# In bun images, the user is 'bun' (uid 1000)
# We'll stick with the standard bun user for simplicity
RUN mkdir .next && chown bun:bun .next

COPY --from=builder /app/package.json ./package.json

COPY --from=builder --chown=bun:bun /app/.next/standalone ./
COPY --from=builder --chown=bun:bun /app/.next/static ./.next/static
COPY --from=builder --chown=bun:bun /app/public ./public

COPY --chown=bun:bun prisma ./prisma/
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

USER bun

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "server.js"]

