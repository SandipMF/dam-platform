# --- Build Stage ---
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci
COPY src ./src
RUN npm run build

# --- Run Stage ---
FROM node:18-alpine
WORKDIR /app
# install FFmpeg + Sharp deps
RUN apk add --no-cache ffmpeg vips-dev
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --omit=dev
CMD ["node", "dist/index.js"]
