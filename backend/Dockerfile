
# Use an official Node image
FROM node:18-alpine

WORKDIR /app

# Copy package.json and install deps
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Expose port used by backend
EXPOSE 3001

# Start server
CMD ["npm", "start"]

