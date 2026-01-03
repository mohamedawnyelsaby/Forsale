import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { paymentId } = body;
    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId required' }, { status: 400 });
    }
    // Logic for Pi Network SDK approval goes here
    return NextResponse.json({ success: true, paymentId, message: 'Approved' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
