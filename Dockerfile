FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies for native addons (most common fix)
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
COPY --from=builder /app/next.config.js ./
RUN npm ci --omit=dev
EXPOSE 3000
CMD ["npm", "start"]