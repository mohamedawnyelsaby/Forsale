# Use official Node.js
FROM node:18

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --force

# Copy source code
COPY . .

# Expose backend port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
