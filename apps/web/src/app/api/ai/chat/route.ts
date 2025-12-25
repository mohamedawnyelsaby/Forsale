// PRODUCTS API - PRODUCTION READY
// apps/web/src/app/api/products/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@forsale/database';
import type { ProductSearchParams } from '@forsale/types';

// ============================================
// GET ALL PRODUCTS (with search & filters)
// ============================================

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const query = searchParams.get('q') || undefined;
    const category = searchParams.get('category') || undefined;
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = {
      status: 'ACTIVE',
    };
    
    // Text search
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }
    
    // Category filter
    if (category) {
      where.category = category;
    }
    
    // Price range
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    
    // Build orderBy
    let orderBy: any = { createdAt: 'desc' };
    
    switch (sortBy) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'popular':
        orderBy = { views: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }
    
    // Execute queries
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
              verificationLevel: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);
    
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;
    
    return NextResponse.json({
      success: true,
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasMore,
      },
    });
  } catch (error) {
    console.error('[Products API] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: 'Failed to fetch products',
        },
      },
      { status: 500 }
    );
  }
}

// ============================================
// CREATE PRODUCT
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { title, description, category, price, quantity, images, sellerId } = body;
    
    // Validation
    if (!title || !description || !category || !price || !sellerId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields',
          },
        },
        { status: 400 }
      );
    }
    
    if (price < 0.01) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PRICE',
            message: 'Price must be at least 0.01 Pi',
          },
        },
        { status: 400 }
      );
    }
    
    // Generate unique slug
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const slug = `${baseSlug}-${Date.now().toString(36)}`;
    
    // Create product
    const product = await prisma.product.create({
      data: {
        title,
        description,
        category,
        price: parseFloat(price),
        quantity: parseInt(quantity) || 1,
        images: images || [],
        slug,
        status: 'ACTIVE',
        sellerId,
      },
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
    });
    
    return NextResponse.json(
      {
        success: true,
        data: product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Products API] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_FAILED',
          message: 'Failed to create product',
        },
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
