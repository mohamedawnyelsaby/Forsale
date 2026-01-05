export type PiNetworkMode = 'sandbox' | 'production' | 'mainnet' | 'testnet';

export interface PiNetworkConfig {
  apiKey: string;
  walletPrivateKey?: string;
  mode: PiNetworkMode;
  apiUrl: string;
}

export interface PiPayment {
  identifier: string;
  amount: number;
  memo: string;
  metadata: Object;
  to_address: string;
  status?: string;
}

export interface PiUser {
  uid: string;
  username: string;
}

export interface User {
  id: string;
  username: string;
  roles: string[];
}
