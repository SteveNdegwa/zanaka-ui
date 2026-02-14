FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++ libc6-compat

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package*.json ./

COPY --from=builder /app/.next ./.next

COPY --from=builder /app/public ./public

RUN apk add --no-cache vips

RUN npm ci --omit=dev --ignore-scripts=false

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["npm", "start"]