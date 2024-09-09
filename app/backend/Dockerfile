# Use Node.js as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Install MySQL client during the build process
RUN apk add --no-cache mysql-client

# Download wait-for-it.sh script to wait for MySQL to be ready
ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /usr/local/bin/wait-for-it.sh
RUN chmod +x /usr/local/bin/wait-for-it.sh

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate the Prisma client (make sure Prisma client is generated here)
RUN npx prisma generate

# Expose the application port
EXPOSE 5000

# Start the application, run both dev migration and deploy migration
CMD ["/usr/local/bin/wait-for-it.sh", "mysql:3306", "-t", "60", "--", "sh", "-c", "npx prisma migrate deploy && npx prisma generate && npm start"]