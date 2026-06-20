# ==========================
# Stage 1: Build
# ==========================
FROM node:20 AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Compile TypeScript
RUN npm run build


# ==========================
# Stage 2: Production
# ==========================
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy compiled JavaScript from builder stage
COPY --from=builder /app/dist ./dist

# Expose application port
EXPOSE 5000

# Start application
CMD ["node", "dist/server.js"]
