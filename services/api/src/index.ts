// ============================================
// FORSALE API SERVER - PRODUCTION GRADE
// World-class backend for global marketplace
// ============================================
// PATH: services/api/src/index.ts

import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { prisma } from '@forsale/database';
import { piNetworkClient } from '@forsale/payments';
import { CommissionCalculator } from '@forsale/utils';
import type { ProductCategory } from '@forsale/types';

// ============================================
// TYPES
// ============================================

interface ProductQuery {
  q?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
  limit?: string;
}

interface CreateProductBody {
  title: string;
  description: string;
  category: ProductCategory;
  price: number;
  quantity: number;
  images: string[];
  sellerId: string;
  condition?: string;
  brand?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

interface CreateOrderBody {
  buyerId: string;
  sellerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  shippingCost: number;
}

// ============================================
// SERVER INITIALIZATION
// ============================================

const server: FastifyInstance = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  },
  trustProxy: true,
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'reqId',
  disableRequestLogging: process.env.NODE_ENV === 'production',
});

// ============================================
// SECURITY & MIDDLEWARE
// ============================================

// CORS Configuration
await server.register(cors, {
  origin: (origin, cb) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://forsale-production.up.railway.app',
      'https://forsale.app',
      'https://www.forsale.app',
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      cb(null, true);
      return;
    }

    cb(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
});

// Security Headers
await server.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'", 'https://api.minepi.com'],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Rate Limiting - Protect against DDoS
await server.register(rateLimit, {
  max: 100, // requests
  timeWindow: '15 minutes',
  cache: 10000,
  allowList: ['127.0.0.1'],
  redis: process.env.REDIS_URL,
  skipOnError: true,
});

// ============================================
// ERROR HANDLER
// ============================================

server.setErrorHandler((error, request, reply) => {
  server.log.error(error);

  const statusCode = error.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal Server Error'
      : error.message;

  reply.status(statusCode).send({
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message,
      statusCode,
    },
    requestId: request.id,
  });
});

// ============================================
// HEALTH CHECK
// ============================================

server.get('/health', async (request, reply) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    // Check Pi Network connection
    const piInfo = piNetworkClient.getNetworkInfo();

    return reply.send({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        piNetwork: piInfo.mode,
        api: 'operational',
      },
      version: '1.0.0',
    });
  } catch (error) {
    return reply.status(503).send({
      success: false,
      status: 'unhealthy',
      error: String(error),
    });
  }
});

// ============================================
// PRODUCTS ROUTES
// ============================================

// Get all products with pagination and filters
server.get<{ Querystring: ProductQuery }>(
  '/api/products',
  {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string' },
          category: { type: 'string' },
          minPrice: { type: 'string' },
          maxPrice: { type: 'string' },
          page: { type: 'string' },
          limit: { type: 'string' },
        },
      },
    },
  },
  async (request, reply) => {
    try {
      const { q, category, minPrice, maxPrice, page = '1', limit = '20' } = request.query;

      const pageNum = parseInt(page, 10);
      const limitNum = Math.min(parseInt(limit, 10), 100); // Max 100 items
      const skip = (pageNum - 1) * limitNum;

      // Build where clause
      const where: any = { status: 'ACTIVE' };

      if (q) {
        where.OR = [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { tags: { has: q } },
        ];
      }

      if (category) {
        where.category = category;
      }

      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = parseFloat(minPrice);
        if (maxPrice) where.price.lte = parseFloat(maxPrice);
      }

      // Execute queries in parallel
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            seller: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                averageRating: true,
                totalSales: true,
                verificationLevel: true,
              },
            },
          },
          take: limitNum,
          skip,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.product.count({ where }),
      ]);

      return reply.send({
        success: true,
        data: products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
          hasMore: skip + products.length < total,
        },
      });
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch products',
      });
    }
  }
);

// Get single product by ID
server.get<{ Params: { id: string } }>(
  '/api/products/:id',
  async (request, reply) => {
    try {
      const { id } = request.params;

      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              bio: true,
              averageRating: true,
              totalSales: true,
              verificationLevel: true,
              responseTime: true,
              createdAt: true,
            },
          },
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
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
        return reply.status(404).send({
          success: false,
          error: 'Product not found',
        });
      }

      // Increment views asynchronously (don't wait)
      prisma.product
        .update({
          where: { id },
          data: { views: { increment: 1 } },
        })
        .catch((err) => server.log.error('Failed to increment views:', err));

      return reply.send({
        success: true,
        data: product,
      });
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch product',
      });
    }
  }
);

// Create new product
server.post<{ Body: CreateProductBody }>(
  '/api/products',
  {
    schema: {
      body: {
        type: 'object',
        required: ['title', 'description', 'category', 'price', 'quantity', 'sellerId'],
        properties: {
          title: { type: 'string', minLength: 3, maxLength: 200 },
          description: { type: 'string', minLength: 10 },
          category: { type: 'string' },
          price: { type: 'number', minimum: 0.01 },
          quantity: { type: 'number', minimum: 1 },
          images: { type: 'array', items: { type: 'string' } },
          sellerId: { type: 'string' },
        },
      },
    },
  },
  async (request, reply) => {
    try {
      const body = request.body;

      // Verify seller exists
      const seller = await prisma.user.findUnique({
        where: { id: body.sellerId },
        select: { id: true, verificationLevel: true },
      });

      if (!seller) {
        return reply.status(404).send({
          success: false,
          error: 'Seller not found',
        });
      }

      // Check if seller can sell
      if (seller.verificationLevel === 'UNVERIFIED' || seller.verificationLevel === 'EMAIL_VERIFIED') {
        return reply.status(403).send({
          success: false,
          error: 'Phone verification required to sell products',
        });
      }

      // Generate unique slug
      const baseSlug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const slug = `${baseSlug}-${Date.now().toString(36)}`;

      // Create product
      const product = await prisma.product.create({
        data: {
          title: body.title,
          description: body.description,
          category: body.category,
          price: body.price,
          quantity: body.quantity,
          images: body.images,
          slug,
          status: 'ACTIVE',
          condition: body.condition || 'NEW',
          brand: body.brand,
          weight: body.weight,
          dimensions: body.dimensions as any,
          seller: { connect: { id: body.sellerId } },
        },
        include: {
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      });

      return reply.status(201).send({
        success: true,
        data: product,
      });
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to create product',
      });
    }
  }
);

// Search products
server.get<{ Querystring: ProductQuery }>(
  '/api/products/search',
  async (request, reply) => {
    try {
      const { q, category, minPrice, maxPrice } = request.query;

      if (!q) {
        return reply.status(400).send({
          success: false,
          error: 'Search query is required',
        });
      }

      const where: any = { status: 'ACTIVE' };

      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { tags: { has: q } },
      ];

      if (category) {
        where.category = category;
      }

      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = parseFloat(minPrice);
        if (maxPrice) where.price.lte = parseFloat(maxPrice);
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
        orderBy: [{ views: 'desc' }, { createdAt: 'desc' }],
      });

      return reply.send({
        success: true,
        data: products,
        total: products.length,
      });
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Search failed',
      });
    }
  }
);

// ============================================
// ORDERS ROUTES
// ============================================

// Create order
server.post<{ Body: CreateOrderBody }>(
  '/api/orders',
  {
    schema: {
      body: {
        type: 'object',
        required: ['buyerId', 'sellerId', 'items', 'shippingAddress', 'shippingCost'],
      },
    },
  },
  async (request, reply) => {
    try {
      const { buyerId, sellerId, items, shippingAddress, shippingCost } = request.body;

      // Calculate totals with commission
      let subtotal = 0;
      let totalCommission = 0;

      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { category: true, price: true },
        });

        if (!product) {
          return reply.status(404).send({
            success: false,
            error: `Product ${item.productId} not found`,
          });
        }

        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;

        const commission = CommissionCalculator.calculate(
          product.category as ProductCategory,
          product.price,
          0
        );
        totalCommission += commission.commission * item.quantity;
      }

      const total = subtotal + shippingCost;
      const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

      // Create order with items
      const order = await prisma.order.create({
        data: {
          orderNumber,
          buyerId,
          sellerId,
          subtotal,
          shippingCost,
          commission: totalCommission,
          total,
          status: 'PENDING_PAYMENT',
          shippingAddress: shippingAddress as any,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              title: '', // Will be updated in production
              price: item.price,
              quantity: item.quantity,
              commission: totalCommission / items.length, // Simplified
            })),
          },
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
              email: true,
            },
          },
          seller: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return reply.status(201).send({
        success: true,
        data: order,
      });
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to create order',
      });
    }
  }
);

// Get user orders
server.get<{ Querystring: { userId: string } }>(
  '/api/orders',
  async (request, reply) => {
    try {
      const { userId } = request.query;

      if (!userId) {
        return reply.status(400).send({
          success: false,
          error: 'userId is required',
        });
      }

      const orders = await prisma.order.findMany({
        where: {
          OR: [{ buyerId: userId }, { sellerId: userId }],
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  images: true,
                  slug: true,
                },
              },
            },
          },
          buyer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return reply.send({
        success: true,
        data: orders,
      });
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch orders',
      });
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

    await prisma.order.update({
      where: { id: orderId },
      data: {
        piTransactionId: payment.identifier,
        status: 'PENDING_PAYMENT',
      },
    });

    return reply.send({
      success: true,
      data: payment,
    });
  } catch (error) {
    server.log.error(error);
    return reply.status(500).send({
      success: false,
      error: 'Payment creation failed',
    });
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

    const order = await prisma.order.findFirst({
      where: { piTransactionId: paymentId },
    });

    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'PAID' },
      });
    }

    return reply.send({
      success: true,
      message: 'Payment completed successfully',
    });
  } catch (error) {
    server.log.error(error);
    return reply.status(500).send({
      success: false,
      error: 'Payment completion failed',
    });
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
          totalOrders: true,
          verificationLevel: true,
          kycVerified: true,
          responseTime: true,
          createdAt: true,
        },
      });

      if (!user) {
        return reply.status(404).send({
          success: false,
          error: 'User not found',
        });
      }

      return reply.send({
        success: true,
        data: user,
      });
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch user',
      });
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
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 FORSALE API SERVER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 URL:         http://${host}:${port}
🔒 Pi Network:  ${piNetworkClient.getNetworkInfo().mode}
📊 Environment: ${process.env.NODE_ENV || 'development'}
🌍 Ready for:   GLOBAL DOMINATION 🌍
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received, shutting down gracefully...`);

  try {
    await server.close();
    await prisma.$disconnect();
    console.log('✅ Server closed successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

start();
