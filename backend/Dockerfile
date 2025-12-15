# ============================================
# 📄 FILENAME: Dockerfile (FINAL - NO BUILD)
# 📍 PATH: backend/Dockerfile
# ============================================

FROM node:18-alpine

WORKDIR /app

# Install tsx globally
RUN npm install -g tsx

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy all source code
COPY . .

# Expose port
EXPOSE 3000

# Run directly with tsx (NO BUILD!)
CMD ["tsx", "src/index.ts"]
