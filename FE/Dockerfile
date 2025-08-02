    # Multi-stage build for React app
    FROM node:18-alpine AS builder

    # Set working directory
    WORKDIR /app

    # Copy package files
    COPY package*.json ./

    # Install all dependencies (including devDependencies for build)
    RUN npm ci

    # Copy source code
    COPY . .

    # Build the app
    RUN npm run build

    # Production stage
    FROM nginx:alpine

    # Copy custom nginx config
    COPY nginx.conf /etc/nginx/nginx.conf

    # Copy built app from builder stage
    COPY --from=builder /app/dist /usr/share/nginx/html

    # Expose port
    EXPOSE 80 443

    # Start nginx
    CMD ["nginx", "-g", "daemon off;"] 