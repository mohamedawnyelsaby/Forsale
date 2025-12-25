// FORSALE MAIN API SERVER - PRODUCTION GRADE
// Path: services/api/src/index.ts

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { prisma } from '@forsale/database';
import { piNetworkClient } from '@forsale/payments';

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
    // Dynamic whitelist: Allows local dev, Railway production, and Pi Network domains
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
// PRODUCTS ROUTES
// ============================================

server.get('/api/products', async (request, reply) => {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            averageRating: true,
          },
        },
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: products };
  } catch (error) {
    server.log.error(error);
    reply.code(500);
    return { success: false, error: 'Failed to fetch products' };
  }
});

server.get<{ Params: { id: string } }>(
  '/api/products/:id',
  async (request, reply) => {
    try {
      const product = await prisma.product.findUnique({
        where: { id: request.params.id },
        include: {
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              averageRating: true,
              totalSales: true,
            },
          },
          reviews: {
            include: {
              user: {
                select: {
                  firstName: true,
                  avatar: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!product) {
        reply.code(404);
        return { success: false, error: 'Product not found' };
      }

      await prisma.product.update({
        where: { id: request.params.id },
        data: { views: { increment: 1 } },
      });

      return { success: true, data: product };
    } catch (error) {
      reply.code(500);
      return { success: false, error: 'Failed to fetch product' };
    }
  }
);

server.post<{
  Body: {
    title: string;
    description: string;
    category: string;
    price: number;
    quantity: number;
    images: string[];
    sellerId: string;
  };
}>('/api/products', async (request, reply) => {
  try {
    const { title, description, category, price, quantity, images, sellerId } = request.body;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36);

    const product = await prisma.product.create({
      data: {
        title,
        description,
        category,
        price,
        quantity,
        images,
        slug,
        status: 'ACTIVE',
        seller: { connect: { id: sellerId } },
      },
    });

    return { success: true, data: product };
  } catch (error) {
    reply.code(500);
    return { success: false, error: 'Failed to create product' };
  }
});

// ============================================
// PI NETWORK PAYMENT ROUTES
// ============================================

server.post<{
  Body: {
    orderId: string;
    amount: number;
    buyerUid: string;
  };
}>('/api/payments/pi/create', async (request, reply) => {
  try {
    const { orderId, amount, buyerUid } = request.body;

    const payment = await piNetworkClient.createPayment({
      amount,
      memo: `Forsale Order #${orderId}`,
      metadata: { orderId },
      uid: buyerUid,
    });

    await prisma.order.update({
      where: { id: orderId },
      data: {
        piTransactionId: payment.identifier,
        status: 'PENDING',
      },
    });

    return { success: true, data: payment };
  } catch (error) {
    reply.code(500);
    return { success: false, error: 'Payment creation failed' };
  }
});

server.post<{
  Body: {
    paymentId: string;
    txid: string;
  };
}>('/api/payments/pi/complete', async (request, reply) => {
  try {
    const { paymentId, txid } = request.body;
    await piNetworkClient.completePayment(paymentId, txid);

    const order = await prisma.order.findFirst({
      where: { piTransactionId: paymentId },
    });

    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'PAID' },
      });
    }

    return { success: true };
  } catch (error) {
    reply.code(500);
    return { success: false, error: 'Payment completion failed' };
  }
});

// ============================================
// START SERVER - OPTIMIZED FOR RAILWAY & LOCAL
// ============================================

const start = async () => {
  try {
    // Modified: Dynamic port detection for Railway (8080) and Local (4000)
    const port = Number(process.env.PORT) || 4000;
    const host = '0.0.0.0'; // Critical for cloud deployment

    await server.listen({ port, host });

    console.log(`
🚀 Forsale API Server Running!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 URL: http://${host}:${port}
📊 Environment: ${process.env.NODE_ENV || 'development'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

// Graceful shutdown for production stability
process.on('SIGTERM', async () => {
  await server.close();
  await prisma.$disconnect();
  process.exit(0);
});
