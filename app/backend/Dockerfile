# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Install MySQL client during the build process
RUN apk add --no-cache mysql-client

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies for the build stage
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate Prisma client (make sure Prisma client is generated here)
RUN npx prisma generate

# Compile the TypeScript files
RUN npm run build

# Stage 2: Production stage
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Install only runtime dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy the built files from the previous stage
COPY --from=builder /app/dist ./dist

# Copy Prisma schema and client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Download wait-for-it.sh script to wait for MySQL to be ready
ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /usr/local/bin/wait-for-it.sh
RUN chmod +x /usr/local/bin/wait-for-it.sh

# Expose the application port
EXPOSE 5000

# Start the application and ensure Prisma migration and client generation are done
CMD ["/usr/local/bin/wait-for-it.sh", "mysql:3306", "-t", "60", "--", "sh", "-c", "npx prisma migrate deploy && npm start"]
