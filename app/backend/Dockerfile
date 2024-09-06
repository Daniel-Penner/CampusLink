# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies, including devDependencies
RUN npm install --include=dev

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the TypeScript code
RUN npm run build

# Expose port
EXPOSE 5000

# Start the server using the compiled JavaScript code
CMD ["node", "dist/index.js"]
