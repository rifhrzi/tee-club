# ---- Base Node ----
FROM node:20-alpine AS base
WORKDIR /app

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV HUSKY=0

# ---- Dependencies ----
FROM base AS deps
# Install dependencies needed for node-gyp on Alpine
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies with cache optimization
RUN npm ci --omit=dev

# ---- Builder ----
FROM base AS builder
WORKDIR /app

# Temporarily set NODE_ENV to development for the build process
# This ensures that all dependencies, including dev dependencies, are available
ENV NODE_ENV=development

# Copy package files for installing dev dependencies
COPY package*.json ./

# Install all dependencies including dev dependencies for build
RUN npm ci

# Copy the rest of the application
COPY . .

# Copy .env.docker to .env for build
COPY .env.docker .env

# Generate Prisma client
RUN npx prisma generate

# Build the application
# Set NODE_ENV back to production for the build step
ENV NODE_ENV=production
RUN npm run build

# ---- Production ----
FROM base AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Add a non-root user to run the app
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app

# Set proper permissions
RUN mkdir -p /app/.next && \
    chown -R nextjs:nodejs /app/.next

# Copy necessary files from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Switch to non-root user
USER nextjs

# Expose port 3000
EXPOSE 3000

# Set proper signal handling for graceful shutdown
ENV NODE_OPTIONS=--max-http-header-size=16384

# Start the application with the correct command for standalone output
CMD ["node", "server.js"]
