# ────────────────────────────────
# Builder stage
# ────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules (sharp, etc.)
RUN apk add --no-cache python3 make g++ libc6-compat

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ────────────────────────────────
# Runner / production stage
# ────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Install only production deps (much smaller)
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

# Optional: if you need sharp/libvips in prod (common for Next.js Image)
RUN apk add --no-cache vips

RUN npm ci --omit=dev --ignore-scripts=false   # --ignore-scripts can break sharp sometimes

# Optional: add non-root user for better security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["npm", "start"]