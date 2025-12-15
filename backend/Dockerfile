# ============================================
# 📄 FILENAME: Dockerfile (Debian for Prisma)
# 📍 PATH: backend/Dockerfile
# ============================================

FROM node:18-slim

# Install OpenSSL and other dependencies
RUN apt-get update -y && \
    apt-get install -y openssl libssl-dev ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma Client with correct binary
RUN npx prisma generate

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start with tsx
CMD ["npx", "tsx", "src/index.ts"]
