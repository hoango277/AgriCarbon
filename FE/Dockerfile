# Multi-stage build for React app
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user
RUN addgroup -g 1001 -S nodejs \
    && adduser -S reactuser -u 1001 -G nodejs

# Set ownership
RUN chown -R reactuser:nodejs /usr/share/nginx/html \
    && chown -R reactuser:nodejs /var/cache/nginx \
    && chown -R reactuser:nodejs /var/log/nginx \
    && chown -R reactuser:nodejs /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown -R reactuser:nodejs /var/run/nginx.pid

# Switch to non-root user
USER reactuser

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 