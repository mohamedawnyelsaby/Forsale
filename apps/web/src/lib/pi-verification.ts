import { NextRequest } from 'next/server';
import crypto from 'crypto';

const PI_API_KEY = process.env.PI_API_KEY;

export async function verifyPiRequest(request: NextRequest): Promise<boolean> {
  try {
    const signature = request.headers.get('x-pi-signature');
    const timestamp = request.headers.get('x-pi-timestamp');

    if (!signature || !timestamp || !PI_API_KEY) {
      return process.env.NODE_ENV === 'development';
    }

    const body = await request.text();
    const payload = `${timestamp}.${body}`;
    const expectedSignature = crypto
      .createHmac('sha256', PI_API_KEY)
      .update(payload)
      .digest('hex');

    return signature === expectedSignature;
  } catch (error) {
    return false;
  }
}
