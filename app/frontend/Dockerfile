# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Vite project
RUN npm run build

# Expose the port the app runs on
EXPOSE 5173

# Start the application in production mode
CMD ["npm", "run", "preview", "--", "--port", "5173"]
