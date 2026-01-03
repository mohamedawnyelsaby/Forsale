export type PiNetworkMode = 'testnet' | 'mainnet';
export interface PiUser { uid: string; username: string; }
export interface ApiResponse<T> { success: boolean; data?: T; error?: string; }
export type OrderStatus = 'PENDING' | 'PAID' | 'COMPLETED' | 'CANCELLED';
export interface Product { id: string; title: string; price: number; }
