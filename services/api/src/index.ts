// FORSALE MAIN API SERVER - PRODUCTION GRADE
// Path: services/api/src/index.ts

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { prisma } from '@forsale/database';

/**
 * ARCHITECTURAL FIX: Direct relative path resolution.
 * This ensures Node.js v24 locates the export in the payments module
 * specifically for environments where workspace symlinks may fail.
 */
import { piNetworkClient } from '../../payments/src/index';

// ============================================
// FASTIFY SERVER SETUP
// ============================================

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
  trustProxy: true,
});

// ============================================
// PLUGINS & MIDDLEWARE
// ============================================

// Security headers with Pi Network compatibility
await server.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:', '*.minepi.com'],
      connectSrc: ["'self'", 'https://*.minepi.com', 'https://api.minepi.com'],
    },
  },
});

// Advanced CORS - Modified for Pi Browser & Railway stability
await server.register(cors, {
  origin: (origin, cb) => {
    const allowedPatterns = [/localhost/, /\.railway\.app$/, /\.minepi\.com$/];
    if (!origin || allowedPatterns.some(pattern => pattern.test(origin))) {
      cb(null, true);
      return;
    }
    cb(new Error("Not allowed by CORS"), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

// Rate limiting to protect resources
await server.register(rateLimit, {
  max: 100,
  timeWindow: '15 minutes',
});

// ============================================
// HEALTH CHECK
// ============================================

server.get('/health', async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const piInfo = piNetworkClient.getNetworkInfo();
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        piNetwork: piInfo.mode,
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: String(error),
    };
  }
});

// ============================================
// PRODUCTS ROUTES (SIMPLIFIED FOR PRODUCTION)
// ============================================

server.get('/api/products', async (request, reply) => {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        seller: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
      take: 20,
    });
    return { success: true, data: products };
  } catch (error) {
    server.log.error(error);
    reply.code(500);
    return { success: false, error: 'Internal Server Error' };
  }
});

// ============================================
// START SERVER
// ============================================

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 4000;
    const host = '0.0.0.0';

    await server.listen({ port, host });

    console.log(`
🚀 Forsale API Server Running!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 URL: http://${host}:${port}
📊 Mode: Production Ready
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
