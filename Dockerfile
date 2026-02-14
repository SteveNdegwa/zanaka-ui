# ────────────────────────────────
# Builder stage
# ────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install build deps for native modules (sharp, canvas, etc.)
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

# Copy package files first → install prod deps
COPY --from=builder /app/package*.json ./

# Copy built artifacts (these should always exist after successful build)
COPY --from=builder /app/.next ./.next

# Optional public folder (only copy if it exists – avoids error if missing)
COPY --from=builder /app/public ./public

# ─────────────────────────────────────────────────────
# Only copy next.config.* if your project actually has one
# Comment out / remove if you have no custom next.config.js / .mjs / .cjs
# COPY --from=builder /app/next.config.js ./          # ← remove or comment this
# ─────────────────────────────────────────────────────

# If you use next.config.mjs (ESM), use this instead:
# COPY --from=builder /app/next.config.mjs ./

# Optional: sharp / image optimization runtime dep (common for Next/Image)
RUN apk add --no-cache vips

# Install production dependencies only
RUN npm ci --omit=dev --ignore-scripts=false

# Add non-root user (good security practice)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["npm", "start"]