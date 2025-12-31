/**
 * PRODUCT DETAIL API ENDPOINT
 * Get, update, and delete individual products
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@forsale/database';
import { verifyPiAccessToken } from '@/lib/pi-network';

const logger = {
  info: (msg: string, data?: any) => console.log(`[PRODUCT DETAIL] ${msg}`, data || ''),
  error: (msg: string, error: any) => console.error(`[PRODUCT DETAIL ERROR] ${msg}`, error),
};

// GET: Get Product by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            piUsername: true,
            averageRating: true,
            totalSales: true,
          },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                piUsername: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Increment views
    await prisma.product.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      data: { product },
    });

  } catch (error) {
    logger.error('Get product error', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update Product
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const body = await req.json();

    // Check if user owns this product
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: {
        seller: {
          select: { piUserId: true },
        },
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (existingProduct.seller.piUserId !== user.uid) {
      return NextResponse.json(
        { error: 'Unauthorized - Not your product' },
        { status: 403 }
      );
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        price: body.price,
        category: body.category,
        quantity: body.quantity,
        images: body.images,
        status: body.status,
      },
    });

    return NextResponse.json({
      success: true,
      data: { product: updatedProduct },
      message: 'Product updated successfully',
    });

  } catch (error) {
    logger.error('Update product error', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete Product
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    // Check ownership
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        seller: {
          select: { piUserId: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (product.seller.piUserId !== user.uid) {
      return NextResponse.json(
        { error: 'Unauthorized - Not your product' },
        { status: 403 }
      );
    }

    // Soft delete (archive)
    await prisma.product.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });

  } catch (error) {
    logger.error('Delete product error', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
