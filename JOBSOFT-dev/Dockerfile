# Multi-stage build for Next.js app
FROM node:18-bullseye AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM node:18-bullseye AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV TAILWIND_DISABLE_LIGHTNINGCSS=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-bullseye AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV TAILWIND_DISABLE_LIGHTNINGCSS=1
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
EXPOSE 3000
CMD ["npm", "start"]

