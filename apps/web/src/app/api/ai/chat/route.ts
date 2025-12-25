import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@forsale/database';

// إجبار المسار على العمل وقت التشغيل فقط لتجنب أخطاء Prisma أثناء الـ Build
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    
    const products = await prisma.product.findMany({
      where: {
        title: {
          contains: query,
          mode: 'insensitive',
        },
      },
      take: 50,
    });

    return NextResponse.json({ 
      success: true, 
      data: products 
    });
  } catch (error) {
    console.error('AI Chat GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // يمكنك إضافة منطق معالجة الـ AI هنا لاحقاً
    
    return NextResponse.json({ 
      success: true, 
      data: body 
    });
  } catch (error) {
    console.error('AI Chat POST Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' }, 
      { status: 500 }
    );
  }
}
