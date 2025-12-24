// FORSALE MAIN API SERVER - COMPLETE
// Copy to: services/api/src/index.ts

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

// Security headers
await server.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
});

// CORS
await server.register(cors, {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
});

// Rate limiting
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

// Get all products
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
    reply.code(500);
    return { success: false, error: 'Failed to fetch products' };
  }
});

// Get single product
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

      // Increment views
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

// Create product
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
    const { title, description, category, price, quantity, images, sellerId } =
      request.body;

    // Generate slug
    const slug =
      title.toLowerCase().replace(/[^a-z0-9]+/g, '-') +
      '-' +
      Date.now().toString(36);

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

// Search products
server.get<{
  Querystring: {
    q?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}>('/api/products/search', async (request, reply) => {
  try {
    const { q, category, minPrice, maxPrice } = request.query;

    const where: any = { status: 'ACTIVE' };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (minPrice) {
      where.price = { ...where.price, gte: parseFloat(minPrice) };
    }

    if (maxPrice) {
      where.price = { ...where.price, lte: parseFloat(maxPrice) };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        seller: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
            averageRating: true,
          },
        },
      },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: products, total: products.length };
  } catch (error) {
    reply.code(500);
    return { success: false, error: 'Search failed' };
  }
});

// ============================================
// ORDERS ROUTES
// ============================================

// Create order
server.post<{
  Body: {
    buyerId: string;
    sellerId: string;
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
    shippingCost: number;
  };
}>('/api/orders', async (request, reply) => {
  try {
    const { buyerId, sellerId, items, shippingCost } = request.body;

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const commission = subtotal * 0.03; // 3% average
    const total = subtotal + shippingCost;

    // Generate order number
    const orderNumber = 'ORD-' + Date.now().toString(36).toUpperCase();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        buyerId,
        sellerId,
        subtotal,
        shippingCost,
        commission,
        total,
        status: 'PENDING',
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            title: '', // Would fetch from product
            price: item.price,
            quantity: item.quantity,
            commission: item.price * 0.03,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return { success: true, data: order };
  } catch (error) {
    reply.code(500);
    return { success: false, error: 'Failed to create order' };
  }
});

// Get user orders
server.get<{ Querystring: { userId: string } }>(
  '/api/orders',
  async (request, reply) => {
    try {
      const { userId } = request.query;

      const orders = await prisma.order.findMany({
        where: {
          OR: [{ buyerId: userId }, { sellerId: userId }],
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          buyer: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          seller: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return { success: true, data: orders };
    } catch (error) {
      reply.code(500);
      return { success: false, error: 'Failed to fetch orders' };
    }
  }
);

// ============================================
// PI NETWORK PAYMENT ROUTES
// ============================================

// Create Pi payment
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

    // Update order with payment ID
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

// Complete Pi payment
server.post<{
  Body: {
    paymentId: string;
    txid: string;
  };
}>('/api/payments/pi/complete', async (request, reply) => {
  try {
    const { paymentId, txid } = request.body;

    await piNetworkClient.completePayment(paymentId, txid);

    // Update order status
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
// USER ROUTES
// ============================================

// Get user profile
server.get<{ Params: { id: string } }>(
  '/api/users/:id',
  async (request, reply) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: request.params.id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          bio: true,
          averageRating: true,
          totalSales: true,
          verificationLevel: true,
          createdAt: true,
        },
      });

      if (!user) {
        reply.code(404);
        return { success: false, error: 'User not found' };
      }

      return { success: true, data: user };
    } catch (error) {
      reply.code(500);
      return { success: false, error: 'Failed to fetch user' };
    }
  }
);

// ============================================
// START SERVER
// ============================================

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '4000', 10);
    const host = process.env.HOST || '0.0.0.0';

    await server.listen({ port, host });

    console.log(`
🚀 Forsale API Server Running!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 URL: http://${host}:${port}
🔒 Pi Network: ${piNetworkClient.getNetworkInfo().mode}
📊 Environment: ${process.env.NODE_ENV || 'development'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await server.close();
  await prisma.$disconnect();
  process.exit(0);
});
