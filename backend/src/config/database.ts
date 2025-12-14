// ============================================
// 📄 FILENAME: database.ts
// 📍 PATH: backend/src/config/database.ts
// ============================================

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

export const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

export const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
};

export const disconnectDB = async () => {
  await prisma.$disconnect();
};
