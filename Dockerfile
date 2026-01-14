# =========================
# 1. Builder stage
# =========================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy dependency files

COPY package.json pnpm-lock.yaml* ./

# Install pnpm globally
RUN apk add --no-cache bash curl unzip git build-base \
    && curl -LO https://github.com/protocolbuffers/protobuf/releases/download/v27.1/protoc-27.1-linux-x86_64.zip \
    && unzip protoc-27.1-linux-x86_64.zip -d /usr/local \
    && rm -f protoc-27.1-linux-x86_64.zip

RUN npm install -g pnpm

# Install all dependencies (dev + prod)
RUN pnpm install  --prod --frozen-lockfile

# Copy all project files
COPY . .
RUN pnpm add -D typescript
RUN pnpm add -D @types/node
RUN pnpm i https://github.com/Harsh-Tagra/grpc-protos.git
COPY  prisma  ./prisma
RUN pnpm prisma generate
RUN pnpm grpc:generate
# Build TS → JS
RUN pnpm run build



# =========================
# 2. Runtime stage
# =========================
FROM node:20-alpine AS runner

WORKDIR /app

# Copy only production dependencies
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile


COPY  prisma  ./prisma
# Copy compiled output from builder
COPY --from=builder /app/dist ./dist
RUN pnpm prisma generate

# Copy any non-TS assets (like .env, configs, public/)
COPY --from=builder /app/package.json ./ 

# Expose port (change if needed)
EXPOSE 5000

# Start app
CMD ["node", "dist/src/index.js"]