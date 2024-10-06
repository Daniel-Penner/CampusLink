# Use Node.js as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build TypeScript into JavaScript
RUN npm run build

# Expose the application port
EXPOSE 5000

# Start the application
CMD ["node", "dist/index.js"]
