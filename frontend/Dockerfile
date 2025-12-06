
########################################
# 1. Build Stage
########################################
FROM node:18-alpine AS build

WORKDIR /app

# Accept build args for Vite env variables
ARG VITE_API_URL
ARG VITE_SOCKET_URL

# Set env vars so Vite picks them up during build
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_SOCKET_URL=${VITE_SOCKET_URL}

# Copy package metadata and install deps
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

########################################
# 2. NGINX Serve Stage
########################################
FROM nginx:alpine

# Copy nginx config (SPA-friendly)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

