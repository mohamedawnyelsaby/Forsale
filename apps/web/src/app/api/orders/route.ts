/**
 * ORDERS API ENDPOINT
 * Create and list orders
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@forsale/database';
import { verifyPiAccessToken } from '@/lib/pi-network';
import { CommissionCalculator } from '@forsale/utils';

const logger = {
  info: (msg: string, data?: any) => console.log(`[ORDERS] ${msg}`, data || ''),
  error: (msg: string, error: any) => console.error(`[ORDERS ERROR] ${msg}`, error),
};

// POST: Create Order
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7);
    const user = await verifyPiAccessToken(accessToken);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items required' },
        { status: 400 }
      );
    }

    logger.info('Creating order', { userId: user.uid, itemCount: items.length });

    // Get buyer from database
    const buyer = await prisma.user.findUnique({
      where: { piUserId: user.uid },
    });

    if (!buyer) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get products
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: { 
        id: { in: productIds },
        status: 'ACTIVE',
      },
      include: {
        seller: true,
      },
    });

    if (products.length !== items.length) {
      return NextResponse.json(
        { error: 'Some products not found or unavailable' },
        { status: 400 }
      );
    }

    // Validate quantities
    for (const item of items) {
      const product = products.find((p: any) => p.id === item.productId);
      if (!product || product.quantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient quantity for product: ${product?.title}` },
          { status: 400 }
        );
      }
    }

    // Check all items are from same seller
    const sellerIds = [...new Set(products.map((p: any) => p.sellerId))];
    if (sellerIds.length > 1) {
      return NextResponse.json(
        { error: 'All items must be from the same seller' },
        { status: 400 }
      );
    }

    const sellerId = sellerIds[0];

    // Calculate totals
    let subtotal = 0;
    let totalCommission = 0;

    const orderItems = items.map((item: any) => {
      const product = products.find((p: any) => p.id === item.productId)!;
      const itemTotal = product.price * item.quantity;
      
      const commission = CommissionCalculator.calculate(
        product.category as any,
        itemTotal,
        0
      );

      subtotal += itemTotal;
      totalCommission += commission.commission;

      return {
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
        commission: commission.commission,
      };
    });

    const shippingCost = 0; // TODO: Calculate shipping
    const total = subtotal + shippingCost;

    // Generate order number
    const orderNumber = `FS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        buyerId: buyer.id,
        sellerId,
        status: 'PENDING',
        subtotal,
        shippingCost,
        commission: totalCommission,
        total,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
        seller: {
          select: {
            piUsername: true,
          },
        },
      },
    });

    logger.info('Order created', { orderId: order.id, orderNumber: order.orderNumber });

    return NextResponse.json({
      success: true,
      data: { order },
      message: 'Order created successfully',
    });

  } catch (error) {
    logger.error('Create order error', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: List Orders
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7);
    const user = await verifyPiAccessToken(accessToken);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'purchases';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const dbUser = await prisma.user.findUnique({
      where: { piUserId: user.uid },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const where = type === 'sales' 
      ? { sellerId: dbUser.id }
      : { buyerId: dbUser.id };

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  title: true,
                  images: true,
                },
              },
            },
          },
          buyer: {
            select: {
              piUsername: true,
            },
          },
          seller: {
            select: {
              piUsername: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });

  } catch (error) {
    logger.error('List orders error', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
