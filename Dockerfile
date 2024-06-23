# Use the official Node.js image from the Docker Hub
FROM node:18-alpine AS build

# Create a directory for the application
WORKDIR /app

# Copy package.json and package-lock.json
COPY . .

# Install dependencies
RUN npm install

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "./src/app.js"]