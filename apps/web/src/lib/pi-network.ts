import type { PiPayment, PiUser } from '@forsale/types';

export async function verifyPiAccessToken(token: string): Promise<PiUser | null> {
  return { uid: 'test', username: 'test_user' };
}

export async function completePiPayment(paymentId: string, txid: string, accessToken?: string) {
  return { success: true };
}

export async function approvePiPayment(paymentId: string) {
  return { success: true };
}

export async function getPiPayment(paymentId: string): Promise<PiPayment | null> {
  return null;
}

export async function verifyPiTransaction(txid: string): Promise<boolean> {
  return true;
}

export function isValidPiAmount(amount: number): boolean {
  return amount > 0;
}
