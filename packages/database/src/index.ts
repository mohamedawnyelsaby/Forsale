import { PrismaClient } from '../node_modules/.prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
<<<<<<< HEAD
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
=======
    log: ['error'],
>>>>>>> c7462e7 (fix: explicit prisma paths for monorepo compatibility)
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export * from '../node_modules/.prisma/client';
