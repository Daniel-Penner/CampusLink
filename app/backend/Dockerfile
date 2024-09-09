# Use Node.js as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Install MySQL client during the build process
RUN apk add --no-cache mysql-client

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

RUN npm run build

# Generate the Prisma client (make sure Prisma client is generated here)
RUN npx prisma generate

# Expose the application port
EXPOSE 5000

# Start the application and deploy migrations
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
